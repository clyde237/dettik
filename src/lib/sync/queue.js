import { getPendingOperations, markSuccess, markFailed } from '$lib/db/sync-queue.js';
import { supabase } from '$lib/supabase/client';

/**
 * Processer une opération de la file de sync
 * @param {import('$lib/db/sync-queue').SyncOperation} op
 * @returns {Promise<void>}
 */
async function processOperation(op) {
  const { table_name, operation, record_id, data } = op;

  switch (operation) {
    case 'create': {
      const { error } = await supabase.from(table_name).insert(data);
      if (error) throw error;
      break;
    }
    case 'update': {
      const { error } = await supabase
        .from(table_name)
        .update(data)
        .eq('id', record_id);
      if (error) throw error;
      break;
    }
    case 'delete': {
      const { error } = await supabase
        .from(table_name)
        .delete()
        .eq('id', record_id);
      if (error) throw error;
      break;
    }
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