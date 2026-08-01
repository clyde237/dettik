import { apiGet, apiPost, apiPatch, apiDelete } from './api.js';

/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} user_id
 * @property {string} person_id
 * @property {'debt' | 'credit'} type
 * @property {number} total_amount
 * @property {number} remaining_amount
 * @property {string} currency
 * @property {string|null} description
 * @property {string} loan_date
 * @property {string|null} due_date
 * @property {number|null} interest_rate
 * @property {'active' | 'archived'} status
 * @property {string|null} archived_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {import('$lib/stores/persons').Person} [person]
 */

/**
 * Récupérer toutes les dettes (type = 'debt') actives
 * @returns {Promise<Debt[]>}
 */
export function getDebts() {
	return apiGet('/api/debts', { type: 'debt', status: 'active' });
}

/**
 * Récupérer une dette par son ID avec la personne liée
 * @param {string} id
 * @returns {Promise<Debt>}
 */
export function getDebt(id) {
	return apiGet(`/api/debts/${id}`);
}

/**
 * Créer une nouvelle dette
 * @param {{
 *   person_id: string,
 *   type: 'debt' | 'credit',
 *   total_amount: number,
 *   currency?: string,
 *   description?: string,
 *   loan_date: string,
 *   due_date?: string,
 *   interest_rate?: number
 * }} params
 * @returns {Promise<Debt>}
 */
export function createDebt({
	person_id,
	type,
	total_amount,
	currency = 'XAF',
	description,
	loan_date,
	due_date,
	interest_rate
}) {
	return apiPost('/api/debts', {
		person_id,
		type,
		total_amount,
		currency,
		description: description?.trim() || null,
		loan_date,
		due_date: due_date || null,
		interest_rate: interest_rate || null
	});
}

/**
 * Mettre à jour une dette
 *
 * Le recalcul du remaining_amount lorsque le total change est désormais fait
 * côté serveur, dans la même requête.
 *
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
 * @returns {Promise<Debt>}
 */
export function updateDebt(id, updates) {
	return apiPatch(`/api/debts/${id}`, updates);
}

/**
 * Supprimer une dette
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDebt(id) {
	await apiDelete(`/api/debts/${id}`);
}

/**
 * Archiver une dette manuellement
 * @param {string} id
 * @returns {Promise<Debt>}
 */
export function archiveDebt(id) {
	return apiPatch(`/api/debts/${id}`, { status: 'archived' });
}

/**
 * Restaurer une dette archivée
 * @param {string} id
 * @returns {Promise<Debt>}
 */
export function restoreDebt(id) {
	return apiPatch(`/api/debts/${id}`, { status: 'active' });
}

/**
 * Récupérer les dettes archivées
 * @returns {Promise<Debt[]>}
 */
export function getArchivedDebts() {
	return apiGet('/api/debts', { type: 'debt', status: 'archived' });
}

/**
 * Récupérer les statistiques des dettes
 * @returns {Promise<{ total: number, totalRemaining: number, count: number }>}
 */
export function getDebtsStats() {
	return apiGet('/api/debts/stats', { type: 'debt' });
}
