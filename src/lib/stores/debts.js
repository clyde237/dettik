import { writable, derived } from 'svelte/store';
import {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  archiveDebt,
  restoreDebt
} from '$lib/services/debts.service';
import { toastSuccess, toastError } from '$lib/stores/notifications';

import { localGetDebts, localSaveDebts } from '$lib/db/debts.js';
import { isOnline } from '$lib/sync/online.js';
import { get } from 'svelte/store';
import { enqueue } from '$lib/db/sync-queue.js';

/**
 * @typedef {import('$lib/services/debts.service').Debt} Debt
 */

/**
 * @typedef {Object} DebtsState
 * @property {Debt[]} list
 * @property {boolean} loading
 * @property {boolean} loaded
 * @property {string} searchQuery
 * @property {'date' | 'amount' | 'name'} sortBy
 * @property {'asc' | 'desc'} sortOrder
 */

/** @type {import('svelte/store').Writable<DebtsState>} */
export const debts = writable({
  list: [],
  loading: false,
  loaded: false,
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc'
});

/**
 * Liste filtrée et triée
 */
export const filteredDebts = derived(debts, ($debts) => {
  let result = [...$debts.list];

  // Filtre par recherche
  const query = $debts.searchQuery.toLowerCase().trim();
  if (query) {
    result = result.filter((debt) =>
      debt.person?.name?.toLowerCase().includes(query) ||
      debt.description?.toLowerCase().includes(query)
    );
  }

  // Tri
  result.sort((a, b) => {
    let comparison = 0;

    switch ($debts.sortBy) {
      case 'date':
        comparison = new Date(a.loan_date).getTime() - new Date(b.loan_date).getTime();
        break;
      case 'amount':
        comparison = a.remaining_amount - b.remaining_amount;
        break;
      case 'name':
        comparison = (a.person?.name || '').localeCompare(b.person?.name || '');
        break;
    }

    return $debts.sortOrder === 'desc' ? -comparison : comparison;
  });

  return result;
});

/**
 * Statistiques dérivées
 */
export const debtsStats = derived(debts, ($debts) => {
  const active = $debts.list;
  return {
    count: active.length,
    totalAmount: active.reduce((sum, d) => sum + Number(d.total_amount), 0),
    totalRemaining: active.reduce((sum, d) => sum + Number(d.remaining_amount), 0),
    totalPaid: active.reduce((sum, d) => sum + (Number(d.total_amount) - Number(d.remaining_amount)), 0)
  };
});

/**
 * Charger toutes les dettes actives
 */
export async function loadDebts() {
  debts.update((state) => ({ ...state, loading: true }));

  try {
    if (get(isOnline)) {
      // En ligne : charger depuis Supabase et mettre en cache
      const data = await getDebts();
      await localSaveDebts(data); // Cache local
      debts.update((state) => ({ ...state, list: data, loading: false, loaded: true }));
    } else {
      // Hors ligne : charger depuis IndexedDB
      const { data: { user } } = await supabase.auth.getUser();
      const data = user ? await localGetDebts(user.id) : [];
      debts.update((state) => ({ ...state, list: data, loading: false, loaded: true }));
    }
  } catch (err) {
    // Fallback sur cache local en cas d'erreur réseau
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const cached = user ? await localGetDebts(user.id) : [];
      debts.update((state) => ({ ...state, list: cached, loading: false, loaded: true }));
    } catch {
      debts.update((state) => ({ ...state, loading: false }));
      toastError('Erreur chargement — mode hors ligne');
    }
  }
}
/**
 * Ajouter une dette
 * @param {Parameters<typeof createDebt>[0]} data
 * @returns {Promise<Debt|null>}
 */
export async function addDebt(data) {
  try {
    let newDebt;

    if (get(isOnline)) {
      newDebt = await createDebt(data);
      //await localSaveDebt(newDebt); // Cache
    } else {
      // Hors ligne : créer localement et mettre en file
      const { data: { user } } = await supabase.auth.getUser();
      newDebt = {
        ...data,
        id: crypto.randomUUID(),
        user_id: user?.id || '',
        remaining_amount: data.total_amount,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
        _pendingSync: true
      };
      //await localSaveDebt(newDebt);
      await enqueue({ table_name: 'debts', operation: 'create', record_id: newDebt.id, data: newDebt });
      syncStore.refreshPendingCount();
    }

    debts.update((state) => ({ ...state, list: [newDebt, ...state.list] }));
    toastSuccess(get(isOnline) ? 'Dette ajoutée' : 'Dette ajoutée (hors ligne)');
    return newDebt;
  } catch (err) {
    toastError("Erreur lors de l'ajout de la dette");
    console.error(err);
    return null;
  }
}

/**
 * Modifier une dette
 * @param {string} id
 * @param {Parameters<typeof updateDebt>[1]} data
 * @returns {Promise<Debt|null>}
 */
export async function editDebt(id, data) {
  try {
    const updated = await updateDebt(id, data);

    debts.update((state) => ({
      ...state,
      list: state.list.map((d) => (d.id === id ? updated : d))
    }));

    toastSuccess('Dette modifiée');
    return updated;
  } catch (err) {
    toastError('Erreur lors de la modification');
    console.error(err);
    return null;
  }
}

/**
 * Supprimer une dette
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function removeDebt(id) {
  try {
    await deleteDebt(id);

    debts.update((state) => ({
      ...state,
      list: state.list.filter((d) => d.id !== id)
    }));

    toastSuccess('Dette supprimée');
    return true;
  } catch (err) {
    toastError('Erreur lors de la suppression');
    console.error(err);
    return false;
  }
}

/**
 * Archiver une dette
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function archiveDebtStore(id) {
  try {
    await archiveDebt(id);

    debts.update((state) => ({
      ...state,
      list: state.list.filter((d) => d.id !== id)
    }));

    toastSuccess('Dette archivée');
    return true;
  } catch (err) {
    toastError('Erreur lors de l\'archivage');
    console.error(err);
    return false;
  }
}

/**
 * Restaurer une dette archivée
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function restoreDebtStore(id) {
  try {
    const restored = await restoreDebt(id);

    debts.update((state) => ({
      ...state,
      list: [restored, ...state.list]
    }));

    toastSuccess('Dette restaurée');
    return true;
  } catch (err) {
    toastError('Erreur lors de la restauration');
    console.error(err);
    return false;
  }
}

/**
 * Mettre à jour la recherche
 * @param {string} query
 */
export function setDebtSearch(query) {
  debts.update((state) => ({ ...state, searchQuery: query }));
}

/**
 * Mettre à jour le tri
 * @param {'date' | 'amount' | 'name'} sortBy
 */
export function setDebtSort(sortBy) {
  debts.update((state) => ({
    ...state,
    sortBy,
    sortOrder: state.sortBy === sortBy && state.sortOrder === 'desc' ? 'asc' : 'desc'
  }));
}

/**
 * Mettre à jour le remaining_amount localement (après un versement)
 * @param {string} id
 * @param {number} newRemaining
 */
export function updateDebtRemaining(id, newRemaining) {
  debts.update((state) => ({
    ...state,
    list: state.list.map((d) =>
      d.id === id
        ? { ...d, remaining_amount: newRemaining, status: newRemaining <= 0 ? 'archived' : 'active' }
        : d
    ).filter((d) => d.status === 'active')
  }));
}