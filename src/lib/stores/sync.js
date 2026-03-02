import { writable, derived } from 'svelte/store';
import { getPendingCount } from '$lib/db/sync-queue.js';

/**
 * @typedef {Object} SyncState
 * @property {boolean} syncing
 * @property {Date | null} lastSync
 * @property {number} pendingCount
 * @property {string | null} error
 */

/** @type {import('svelte/store').Writable<SyncState>} */
const _syncStore = writable({
  syncing: false,
  lastSync: null,
  pendingCount: 0,
  error: null
});

export const syncState = { subscribe: _syncStore.subscribe };

/** Status dérivé lisible */
export const syncStatus = derived(_syncStore, ($s) => {
  if ($s.syncing) return 'syncing';
  if ($s.error) return 'error';
  if ($s.pendingCount > 0) return 'pending';
  return 'synced';
});

export const syncStore = {
  setSyncing: (/** @type {boolean} */ val) =>
    _syncStore.update((s) => ({ ...s, syncing: val })),

  setLastSync: (/** @type {Date} */ date) =>
    _syncStore.update((s) => ({ ...s, lastSync: date, error: null })),

  setError: (/** @type {string} */ msg) =>
    _syncStore.update((s) => ({ ...s, error: msg, syncing: false })),

  clearError: () =>
    _syncStore.update((s) => ({ ...s, error: null })),

  setPendingCount: (/** @type {number} */ count) =>
    _syncStore.update((s) => ({ ...s, pendingCount: count })),

  /** Rafraîchir le compteur depuis IndexedDB */
  refreshPendingCount: async () => {
    try {
      const count = await getPendingCount();
      _syncStore.update((s) => ({ ...s, pendingCount: count }));
    } catch {
      // Silencieux si IndexedDB indisponible
    }
  }
};