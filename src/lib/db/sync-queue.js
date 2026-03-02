import { openDB, dbGetAll, dbPut, dbDelete, dbTransaction } from './index.js';

/**
 * @typedef {Object} SyncOperation
 * @property {number} [id]
 * @property {'debts'|'persons'|'payments'} table_name
 * @property {'create'|'update'|'delete'} operation
 * @property {string} record_id
 * @property {any} data
 * @property {'pending'|'processing'|'failed'} status
 * @property {number} retry_count
 * @property {string} created_at
 * @property {string|null} error
 */

/**
 * Ajouter une opération à la file
 * @param {{ table_name: SyncOperation['table_name'], operation: SyncOperation['operation'], record_id: string, data: any }} params
 */
export async function enqueue({ table_name, operation, record_id, data }) {
  /** @type {SyncOperation} */
  const item = {
    table_name,
    operation,
    record_id,
    data,
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    error: null
  };
  await dbPut('sync_queue', item);
}

/**
 * Récupérer toutes les opérations en attente
 * @returns {Promise<SyncOperation[]>}
 */
export async function getPendingOperations() {
  return dbGetAll('sync_queue', 'status', 'pending');
}

/**
 * Marquer une opération comme réussie (la supprimer)
 * @param {number} id
 */
export async function markSuccess(id) {
  await dbDelete('sync_queue', id);
}

/**
 * Marquer une opération comme échouée
 * @param {number} id @param {string} error
 */
export async function markFailed(id, error) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore(tx.objectStoreNames[0] === 'sync_queue' ? 'sync_queue' : 'sync_queue');
    const req = store.get(id);
    req.onsuccess = () => {
      const item = req.result;
      if (item) {
        item.status = item.retry_count >= 3 ? 'failed' : 'pending';
        item.retry_count += 1;
        item.error = error;
        store.put(item);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Nombre d'opérations en attente
 * @returns {Promise<number>}
 */
export async function getPendingCount() {
  const ops = await getPendingOperations();
  return ops.length;
}

/**
 * Vider la file (après sync complet réussi)
 */
export async function clearQueue() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('sync_queue', 'readwrite');
    const req = tx.objectStore('sync_queue').clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}