import { apiGet, apiPost, apiPatch, apiDelete } from './api.js';

/**
 * @typedef {import('$lib/services/debts.service').Debt} Credit
 */

/**
 * Récupérer toutes les créances actives
 * @returns {Promise<Credit[]>}
 */
export function getCredits() {
	return apiGet('/api/debts', { type: 'credit', status: 'active' });
}

/**
 * Récupérer une créance par son ID
 * @param {string} id
 * @returns {Promise<Credit>}
 */
export function getCredit(id) {
	return apiGet(`/api/debts/${id}`);
}

/**
 * Créer une nouvelle créance
 * @param {{
 *   person_id: string,
 *   total_amount: number,
 *   currency?: string,
 *   description?: string,
 *   loan_date: string,
 *   due_date?: string,
 *   interest_rate?: number
 * }} params
 * @returns {Promise<Credit>}
 */
export function createCredit({
	person_id,
	total_amount,
	currency = 'XAF',
	description,
	loan_date,
	due_date,
	interest_rate
}) {
	return apiPost('/api/debts', {
		person_id,
		type: 'credit',
		total_amount,
		currency,
		description: description?.trim() || null,
		loan_date,
		due_date: due_date || null,
		interest_rate: interest_rate || null
	});
}

/**
 * Mettre à jour une créance
 * @param {string} id
 * @param {{
 *   person_id?: string,
 *   total_amount?: number,
 *   currency?: string,
 *   description?: string,
 *   loan_date?: string,
 *   due_date?: string,
 *   interest_rate?: number
 * }} updates
 * @returns {Promise<Credit>}
 */
export function updateCredit(id, updates) {
	return apiPatch(`/api/debts/${id}`, updates);
}

/**
 * Supprimer une créance
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteCredit(id) {
	await apiDelete(`/api/debts/${id}`);
}

/**
 * Archiver une créance
 * @param {string} id
 * @returns {Promise<Credit>}
 */
export function archiveCredit(id) {
	return apiPatch(`/api/debts/${id}`, { status: 'archived' });
}

/**
 * Restaurer une créance archivée
 * @param {string} id
 * @returns {Promise<Credit>}
 */
export function restoreCredit(id) {
	return apiPatch(`/api/debts/${id}`, { status: 'active' });
}

/**
 * Récupérer les créances archivées
 * @returns {Promise<Credit[]>}
 */
export function getArchivedCredits() {
	return apiGet('/api/debts', { type: 'credit', status: 'archived' });
}
