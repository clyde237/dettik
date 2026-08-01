import { getPendingOperations, markSuccess, markFailed } from '$lib/db/sync-queue.js';
import { apiPost, apiPatch, apiDelete } from '$lib/services/api.js';

/**
 * Chemin de collection par table de la file.
 * @type {Record<import('$lib/db/sync-queue').SyncOperation['table_name'], string>}
 */
const ENDPOINTS = {
	debts: '/api/debts',
	persons: '/api/persons',
	payments: '/api/payments'
};

/**
 * Processer une opération de la file de sync
 *
 * Les opérations partaient auparavant directement vers PostgREST. Elles passent
 * maintenant par les endpoints applicatifs, qui appliquent le cloisonnement par
 * utilisateur. L'ID généré localement est transmis à la création pour que la
 * ligne distante porte le même identifiant que la copie locale.
 *
 * @param {import('$lib/db/sync-queue').SyncOperation} op
 * @returns {Promise<void>}
 */
async function processOperation(op) {
	const { table_name, operation, record_id, data } = op;

	const endpoint = ENDPOINTS[table_name];
	if (!endpoint) throw new Error(`Table non synchronisable : ${table_name}`);

	switch (operation) {
		case 'create':
			await apiPost(endpoint, { ...data, id: data?.id ?? record_id });
			break;

		case 'update':
			if (table_name === 'payments') {
				throw new Error('Les versements ne sont pas modifiables');
			}
			await apiPatch(`${endpoint}/${record_id}`, data);
			break;

		case 'delete':
			await apiDelete(`${endpoint}/${record_id}`);
			break;
	}
}

/**
 * Vider la file de sync (envoyer toutes les opérations en attente)
 * @returns {Promise<{ success: number, failed: number }>}
 */
export async function flushQueue() {
	const pending = await getPendingOperations();
	let success = 0;
	let failed = 0;

	for (const op of pending) {
		try {
			await processOperation(op);
			await markSuccess(/** @type {number} */ (op.id));
			success++;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Erreur inconnue';
			await markFailed(/** @type {number} */ (op.id), message);
			failed++;
		}
	}

	return { success, failed };
}
