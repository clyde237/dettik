import { query, queryOne, execute } from '../turso.js';
import { newId } from '$lib/utils/id.js';

/**
 * Vérifie qu'un versement appartient bien à l'utilisateur.
 * @param {string} userId
 * @param {string} paymentId
 */
export async function ownsPayment(userId, paymentId) {
	const row = await queryOne(
		`SELECT pa.id
       FROM payments pa
       JOIN debts d ON d.id = pa.debt_id
      WHERE pa.id = ? AND d.user_id = ?`,
		[paymentId, userId]
	);
	return row !== null;
}

/**
 * Preuves d'un versement, de la plus ancienne à la plus récente.
 * @param {string} userId
 * @param {string} paymentId
 */
export function listProofs(userId, paymentId) {
	return query(
		`SELECT pr.*
       FROM payment_proofs pr
       JOIN payments pa ON pa.id = pr.payment_id
       JOIN debts d     ON d.id = pa.debt_id
      WHERE pr.payment_id = ? AND d.user_id = ?
      ORDER BY pr.created_at ASC`,
		[paymentId, userId]
	);
}

/**
 * @param {string} userId
 * @param {string} id
 */
export function getProof(userId, id) {
	return queryOne(
		`SELECT pr.*
       FROM payment_proofs pr
       JOIN payments pa ON pa.id = pr.payment_id
       JOIN debts d     ON d.id = pa.debt_id
      WHERE pr.id = ? AND d.user_id = ?`,
		[id, userId]
	);
}

/**
 * @param {string} userId
 * @param {string} paymentId
 * @param {{ file_url: string, file_name: string, file_type: string, file_size: number }} data
 */
export async function createProof(userId, paymentId, data) {
	const id = newId();

	await execute(
		`INSERT INTO payment_proofs (id, payment_id, file_url, file_name, file_type, file_size)
     VALUES (?, ?, ?, ?, ?, ?)`,
		[id, paymentId, data.file_url, data.file_name, data.file_type, data.file_size]
	);

	return getProof(userId, id);
}

/**
 * @param {string} userId
 * @param {string} id
 */
export async function deleteProof(userId, id) {
	const proof = await getProof(userId, id);
	if (!proof) return null;

	await execute('DELETE FROM payment_proofs WHERE id = ?', [id]);
	return proof;
}
