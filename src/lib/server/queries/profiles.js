import { query, queryOne, execute, batch } from '../turso.js';

/**
 * @param {string} userId
 */
export function getProfile(userId) {
	return queryOne('SELECT * FROM profiles WHERE id = ?', [userId]);
}

/** Colonnes modifiables depuis l'application. */
const UPDATABLE = [
	'email',
	'full_name',
	'preferred_currency',
	'preferred_language',
	'preferred_theme'
];

/**
 * @param {string} userId
 * @param {Record<string, any>} updates
 */
export async function updateProfile(userId, updates) {
	const columns = UPDATABLE.filter((c) => c in updates);
	if (columns.length === 0) return getProfile(userId);

	await execute(`UPDATE profiles SET ${columns.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [
		...columns.map((c) => updates[c] ?? null),
		userId
	]);

	return getProfile(userId);
}

/**
 * Supprime toutes les données d'un utilisateur.
 *
 * Appelé par le webhook Clerk user.deleted. Reproduit explicitement la chaîne
 * de ON DELETE CASCADE que auth.users assurait côté Supabase, et renvoie les
 * URLs des preuves à effacer de Vercel Blob.
 *
 * @param {string} userId
 * @returns {Promise<{ proofUrls: string[] }>}
 */
export async function deleteUserData(userId) {
	const proofs = await query(
		`SELECT pr.file_url
       FROM payment_proofs pr
       JOIN payments pa ON pa.id = pr.payment_id
       JOIN debts d     ON d.id = pa.debt_id
      WHERE d.user_id = ?`,
		[userId]
	);

	await batch([
		{
			sql: `DELETE FROM payment_proofs
             WHERE payment_id IN (
               SELECT pa.id FROM payments pa
               JOIN debts d ON d.id = pa.debt_id
               WHERE d.user_id = ?
             )`,
			args: [userId]
		},
		{
			sql: `DELETE FROM payments
             WHERE debt_id IN (SELECT id FROM debts WHERE user_id = ?)`,
			args: [userId]
		},
		{ sql: 'DELETE FROM debts WHERE user_id = ?', args: [userId] },
		{ sql: 'DELETE FROM persons WHERE user_id = ?', args: [userId] },
		{ sql: 'DELETE FROM profiles WHERE id = ?', args: [userId] }
	]);

	return { proofUrls: proofs.map((p) => String(p.file_url)) };
}
