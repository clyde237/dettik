import { get } from 'svelte/store';
import { isOnline } from './online.js';
import { flushQueue } from './queue.js';
import { getPendingCount } from '$lib/db/sync-queue.js';
import { syncStore } from '$lib/stores/sync.js';
import { supabase } from '$lib/supabase/client';
import { localSaveDebts } from '$lib/db/debts.js';
import { localSavePersons } from '$lib/db/persons.js';
import { localSavePayments } from '$lib/db/payments.js';

let syncInProgress = false;

/**
 * Synchroniser toutes les données depuis Supabase vers IndexedDB
 */
export async function syncFromRemote() {
  try {
    syncStore.setSyncing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Sync debts + credits
    const { data: debts } = await supabase
      .from('debts')
      .select('*, person:persons(*)')
      .eq('user_id', user.id);

    if (debts) await localSaveDebts(debts);

    // Sync persons
    const { data: persons } = await supabase
      .from('persons')
      .select('*')
      .eq('user_id', user.id);

    if (persons) await localSavePersons(persons);

    syncStore.setLastSync(new Date());
    syncStore.setSyncing(false);
  } catch (err) {
    console.error('[Sync] Erreur syncFromRemote:', err);
    syncStore.setError('Erreur de synchronisation');
    syncStore.setSyncing(false);
  }
}

/**
 * Synchroniser les paiements d'une dette
 * @param {string} debtId
 */
export async function syncPaymentsFromRemote(debtId) {
  try {
    const { data: payments } = await supabase
      .from('payments')
      .select('*, proofs:payment_proofs(*)')
      .eq('debt_id', debtId);

    if (payments) await localSavePayments(payments);
  } catch (err) {
    console.error('[Sync] Erreur syncPayments:', err);
  }
}

/**
 * Déclencher une synchronisation complète (flush queue + sync depuis remote)
 */
export async function triggerSync() {
  if (syncInProgress || !get(isOnline)) return;
  syncInProgress = true;

  try {
    syncStore.setSyncing(true);
    syncStore.clearError();

    // 1. Envoyer les opérations en attente
    const pendingCount = await getPendingCount();
    if (pendingCount > 0) {
      const { success, failed } = await flushQueue();
      console.log(`[Sync] Queue: ${success} succès, ${failed} échoués`);
    }

    // 2. Récupérer les données fraîches
    await syncFromRemote();

    syncStore.setPendingCount(0);
    syncStore.setLastSync(new Date());
  } catch (err) {
    console.error('[Sync] Erreur triggerSync:', err);
    syncStore.setError('Synchronisation échouée');
  } finally {
    syncInProgress = false;
    syncStore.setSyncing(false);
  }
}

/**
 * Initialiser le moteur de sync
 * À appeler au montage de l'app
 * @returns {() => void} cleanup
 */
export function initSyncEngine() {
  // Syncer au retour en ligne
  const unsubscribe = isOnline.subscribe(async (online) => {
    if (online) {
      console.log('[Sync] Retour en ligne — synchronisation...');
      await triggerSync();
    }
  });

  // Syncer toutes les 5 minutes si online
  const interval = setInterval(async () => {
    if (get(isOnline)) {
      await triggerSync();
    }
  }, 5 * 60_000);

  return () => {
    unsubscribe();
    clearInterval(interval);
  };
}