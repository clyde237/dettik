import { query, queryOne, execute } from '../turso.js';
import { newId } from '$lib/utils/id.js';

/**
 * Toutes les personnes de l'utilisateur, triées par nom.
 * @param {string} userId
 */
export function listPersons(userId) {
	return query('SELECT * FROM persons WHERE user_id = ? ORDER BY name ASC', [userId]);
}

/**
 * Recherche par nom, insensible à la casse.
 * Remplace le .ilike() de PostgREST : en SQLite, LIKE est déjà insensible à la
 * casse pour l'ASCII, mais pas pour les accents — d'où le passage par lower().
 * @param {string} userId
 * @param {string} search
 */
export function searchPersons(userId, search) {
	return query(
		`SELECT * FROM persons
      WHERE user_id = ? AND lower(name) LIKE lower(?)
      ORDER BY name ASC
      LIMIT 10`,
		[userId, `%${search}%`]
	);
}

/**
 * Recherche d'une personne par nom exact (insensible à la casse).
 * @param {string} userId
 * @param {string} name
 */
export function findPersonByName(userId, name) {
	return queryOne('SELECT * FROM persons WHERE user_id = ? AND lower(name) = lower(?) LIMIT 1', [
		userId,
		name
	]);
}

/**
 * @param {string} userId
 * @param {string} id
 */
export function getPerson(userId, id) {
	return queryOne('SELECT * FROM persons WHERE id = ? AND user_id = ?', [id, userId]);
}

/**
 * Crée une personne.
 *
 * data.id permet de réutiliser l'identifiant généré côté client lorsqu'une
 * création faite hors ligne est rejouée depuis la file de synchronisation : sans
 * cela, le serveur en générerait un nouveau et le cache local se retrouverait
 * avec un doublon.
 *
 * @param {string} userId
 * @param {{ id?: string, name: string, phone?: string|null, email?: string|null, notes?: string|null }} data
 */
export async function createPerson(userId, data) {
	const id = data.id || newId();

	await execute(
		`INSERT INTO persons (id, user_id, name, phone, email, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
		[id, userId, data.name, data.phone ?? null, data.email ?? null, data.notes ?? null]
	);

	return getPerson(userId, id);
}

/**
 * Mise à jour partielle : seules les colonnes présentes sont écrites.
 * @param {string} userId
 * @param {string} id
 * @param {Record<string, any>} updates
 */
export async function updatePerson(userId, id, updates) {
	const columns = ['name', 'phone', 'email', 'notes'].filter((c) => c in updates);
	if (columns.length === 0) return getPerson(userId, id);

	await execute(
		`UPDATE persons SET ${columns.map((c) => `${c} = ?`).join(', ')}
      WHERE id = ? AND user_id = ?`,
		[...columns.map((c) => updates[c] ?? null), id, userId]
	);

	return getPerson(userId, id);
}

/**
 * Compte les dettes/créances rattachées à une personne.
 * @param {string} userId
 * @param {string} id
 */
export async function countPersonDebts(userId, id) {
	const row = await queryOne(
		'SELECT COUNT(*) AS total FROM debts WHERE person_id = ? AND user_id = ?',
		[id, userId]
	);
	return Number(row?.total ?? 0);
}

/**
 * Supprime une personne.
 *
 * Reproduit le ON DELETE RESTRICT du schéma Postgres : la suppression est
 * refusée si des dettes y font référence. La vérification est explicite car les
 * clés étrangères ne sont pas appliquées sur une écriture isolée.
 *
 * @param {string} userId
 * @param {string} id
 * @returns {Promise<{ deleted: boolean, blocked?: number }>}
 */
export async function deletePerson(userId, id) {
	const referencing = await countPersonDebts(userId, id);
	if (referencing > 0) return { deleted: false, blocked: referencing };

	const result = await execute('DELETE FROM persons WHERE id = ? AND user_id = ?', [id, userId]);
	return { deleted: result.rowsAffected > 0 };
}
