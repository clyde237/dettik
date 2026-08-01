import { query, queryOne, execute, batch, now } from '../turso.js';
import { newId } from '$lib/utils/id.js';

/**
 * Équivalent SQL du select imbriqué PostgREST `*, person:persons(*)`.
 * Les colonnes de persons sont préfixées puis regroupées par mapRow().
 */
const SELECT_WITH_PERSON = `
  SELECT d.*,
         p.id         AS person__id,
         p.user_id    AS person__user_id,
         p.name       AS person__name,
         p.phone      AS person__phone,
         p.email      AS person__email,
         p.notes      AS person__notes,
         p.created_at AS person__created_at,
         p.updated_at AS person__updated_at
    FROM debts d
    JOIN persons p ON p.id = d.person_id`;

/**
 * Reconstruit l'objet imbriqué { ...debt, person: { ... } }.
 * @param {Record<string, any> | null} row
 */
function mapRow(row) {
	if (!row) return null;

	/** @type {Record<string, any>} */
	const debt = {};
	/** @type {Record<string, any>} */
	const person = {};

	for (const [key, value] of Object.entries(row)) {
		if (key.startsWith('person__')) person[key.slice('person__'.length)] = value;
		else debt[key] = value;
	}

	debt.person = person;
	return debt;
}

/**
 * Liste les dettes/créances de l'utilisateur.
 *
 * L'ordre reproduit celui des services : par archived_at décroissant pour les
 * archives, par created_at décroissant sinon.
 *
 * @param {string} userId
 * @param {{ type?: 'debt' | 'credit', status?: 'active' | 'archived' }} [filters]
 */
export async function listDebts(userId, filters = {}) {
	const conditions = ['d.user_id = ?'];
	/** @type {any[]} */
	const args = [userId];

	if (filters.type) {
		conditions.push('d.type = ?');
		args.push(filters.type);
	}
	if (filters.status) {
		conditions.push('d.status = ?');
		args.push(filters.status);
	}

	const orderBy = filters.status === 'archived' ? 'd.archived_at DESC' : 'd.created_at DESC';

	const rows = await query(
		`${SELECT_WITH_PERSON} WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`,
		args
	);

	return rows.map(mapRow);
}

/**
 * @param {string} userId
 * @param {string} id
 */
export async function getDebt(userId, id) {
	const row = await queryOne(`${SELECT_WITH_PERSON} WHERE d.id = ? AND d.user_id = ?`, [
		id,
		userId
	]);
	return mapRow(row);
}

/**
 * data.id permet de réutiliser l'identifiant généré côté client quand une
 * création faite hors ligne est rejouée depuis la file de synchronisation.
 *
 * @param {string} userId
 * @param {{
 *   id?: string,
 *   person_id: string,
 *   type: 'debt' | 'credit',
 *   total_amount: number,
 *   currency?: string,
 *   description?: string|null,
 *   loan_date: string,
 *   due_date?: string|null,
 *   interest_rate?: number|null
 * }} data
 */
export async function createDebt(userId, data) {
	const id = data.id || newId();

	// Sans RLS ni clé étrangère appliquée, c'est ici qu'on vérifie que la
	// personne visée appartient bien à l'utilisateur.
	const person = await queryOne('SELECT id FROM persons WHERE id = ? AND user_id = ?', [
		data.person_id,
		userId
	]);
	if (!person) return null;

	await execute(
		`INSERT INTO debts (
       id, user_id, person_id, type, total_amount, remaining_amount,
       currency, description, loan_date, due_date, interest_rate, status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
		[
			id,
			userId,
			data.person_id,
			data.type,
			data.total_amount,
			data.total_amount,
			data.currency ?? 'XAF',
			data.description ?? null,
			data.loan_date,
			data.due_date ?? null,
			data.interest_rate ?? null
		]
	);

	return getDebt(userId, id);
}

/** Colonnes que le client est autorisé à modifier. */
const UPDATABLE = [
	'person_id',
	'total_amount',
	'remaining_amount',
	'currency',
	'description',
	'loan_date',
	'due_date',
	'interest_rate',
	'status',
	'archived_at'
];

/**
 * Mise à jour partielle.
 *
 * Si total_amount change sans que remaining_amount soit fourni, on recalcule le
 * restant à partir de ce qui a déjà été payé — logique qui vivait auparavant
 * côté client dans updateDebt()/updateCredit().
 *
 * @param {string} userId
 * @param {string} id
 * @param {Record<string, any>} updates
 */
export async function updateDebt(userId, id, updates) {
	const current = await getDebt(userId, id);
	if (!current) return null;

	/** @type {Record<string, any>} */
	const values = {};
	for (const column of UPDATABLE) {
		if (column in updates) values[column] = updates[column] ?? null;
	}

	// Réaffectation à une autre personne : elle doit appartenir à l'utilisateur.
	if (values.person_id && values.person_id !== current.person_id) {
		const person = await queryOne('SELECT id FROM persons WHERE id = ? AND user_id = ?', [
			values.person_id,
			userId
		]);
		if (!person) return null;
	}

	if ('total_amount' in values && !('remaining_amount' in values)) {
		const settled = Number(current.total_amount) - Number(current.remaining_amount);
		values.remaining_amount = Math.max(0, Number(values.total_amount) - settled);
	}

	const columns = Object.keys(values);
	if (columns.length === 0) return current;

	await execute(
		`UPDATE debts SET ${columns.map((c) => `${c} = ?`).join(', ')}
      WHERE id = ? AND user_id = ?`,
		[...columns.map((c) => values[c]), id, userId]
	);

	return getDebt(userId, id);
}

/**
 * @param {string} userId
 * @param {string} id
 */
export function archiveDebt(userId, id) {
	return updateDebt(userId, id, { status: 'archived', archived_at: now() });
}

/**
 * @param {string} userId
 * @param {string} id
 */
export function restoreDebt(userId, id) {
	return updateDebt(userId, id, { status: 'active', archived_at: null });
}

/**
 * Supprime une dette, ses versements et ses preuves.
 *
 * Reproduit explicitement les ON DELETE CASCADE du schéma Postgres, sans
 * dépendre du pragma foreign_keys. Renvoie les URLs des fichiers preuves
 * devenus orphelins pour que l'appelant les supprime de Vercel Blob.
 *
 * @param {string} userId
 * @param {string} id
 * @returns {Promise<{ deleted: boolean, proofUrls: string[] }>}
 */
export async function deleteDebt(userId, id) {
	const owned = await queryOne('SELECT id FROM debts WHERE id = ? AND user_id = ?', [id, userId]);
	if (!owned) return { deleted: false, proofUrls: [] };

	const proofs = await query(
		`SELECT pr.file_url
       FROM payment_proofs pr
       JOIN payments pa ON pa.id = pr.payment_id
      WHERE pa.debt_id = ?`,
		[id]
	);

	await batch([
		{
			sql: `DELETE FROM payment_proofs
             WHERE payment_id IN (SELECT id FROM payments WHERE debt_id = ?)`,
			args: [id]
		},
		{ sql: 'DELETE FROM payments WHERE debt_id = ?', args: [id] },
		{ sql: 'DELETE FROM debts WHERE id = ? AND user_id = ?', args: [id, userId] }
	]);

	return {
		deleted: true,
		proofUrls: proofs.map((p) => String(p.file_url))
	};
}

/**
 * Totaux des dettes ou créances actives.
 * @param {string} userId
 * @param {'debt' | 'credit'} type
 * @returns {Promise<{ total: number, totalRemaining: number, count: number }>}
 */
export async function getStats(userId, type) {
	const row = await queryOne(
		`SELECT COALESCE(SUM(total_amount), 0)     AS total,
            COALESCE(SUM(remaining_amount), 0) AS totalRemaining,
            COUNT(*)                           AS count
       FROM debts
      WHERE user_id = ? AND type = ? AND status = 'active'`,
		[userId, type]
	);

	return {
		total: Number(row?.total ?? 0),
		totalRemaining: Number(row?.totalRemaining ?? 0),
		count: Number(row?.count ?? 0)
	};
}
