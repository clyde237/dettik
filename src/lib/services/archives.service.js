import { apiGet, apiPatch, apiDelete } from './api.js';

/**
 * @typedef {import('$lib/services/debts.service').Debt} ArchivedItem
 */

/**
 * Récupérer toutes les entrées archivées (dettes + créances)
 * @returns {Promise<ArchivedItem[]>}
 */
export function getArchives() {
	return apiGet('/api/debts', { status: 'archived' });
}

/**
 * Récupérer une entrée archivée par son ID
 * @param {string} id
 * @returns {Promise<ArchivedItem>}
 */
export function getArchivedItem(id) {
	return apiGet(`/api/debts/${id}`);
}

/**
 * Restaurer une entrée archivée
 * @param {string} id
 * @returns {Promise<ArchivedItem>}
 */
export function restoreArchive(id) {
	return apiPatch(`/api/debts/${id}`, { status: 'active' });
}

/**
 * Supprimer définitivement une entrée archivée
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteArchive(id) {
	await apiDelete(`/api/debts/${id}`);
}
