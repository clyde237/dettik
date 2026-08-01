import { apiGet, apiPost, apiDelete } from './api.js';

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} debt_id
 * @property {number} amount
 * @property {string} payment_date
 * @property {string} payment_method
 * @property {string|null} notes
 * @property {string} created_at
 * @property {string} updated_at
 * @property {import('./proofs.service').Proof[]} [proofs]
 */

/**
 * Récupérer tous les versements d'une dette/créance
 * @param {string} debtId
 * @returns {Promise<Payment[]>}
 */
export function getPayments(debtId) {
	return apiGet('/api/payments', { debt_id: debtId });
}

/**
 * Récupérer un versement par son ID
 * @param {string} id
 * @returns {Promise<Payment>}
 */
export function getPayment(id) {
	return apiGet(`/api/payments/${id}`);
}

/**
 * Créer un versement et mettre à jour le remaining_amount
 *
 * Le contrôle du montant, l'insertion et la mise à jour de la dette se font
 * désormais dans une seule transaction côté serveur.
 *
 * @param {{
 *   debt_id: string,
 *   amount: number,
 *   payment_date: string,
 *   payment_method: string,
 *   notes?: string
 * }} params
 * @returns {Promise<{ payment: Payment, newRemaining: number }>}
 */
export function createPayment({ debt_id, amount, payment_date, payment_method, notes }) {
	return apiPost('/api/payments', {
		debt_id,
		amount,
		payment_date,
		payment_method,
		notes: notes?.trim() || null
	});
}

/**
 * Supprimer un versement et recalculer le remaining
 *
 * debtId n'est plus nécessaire — le serveur le retrouve depuis le versement —
 * mais reste accepté pour ne pas casser les appels existants.
 *
 * @param {string} paymentId
 * @param {string} [debtId]
 * @returns {Promise<{ newRemaining: number }>}
 */
export function deletePayment(paymentId, debtId) {
	return apiDelete(`/api/payments/${paymentId}`);
}
