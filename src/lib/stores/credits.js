import { writable, derived } from 'svelte/store';
import {
  getCredits,
  createCredit,
  updateCredit,
  deleteCredit,
  archiveCredit,
  restoreCredit
} from '$lib/services/credits.service';
import { toastSuccess, toastError } from '$lib/stores/notifications';

/**
 * @typedef {import('$lib/services/credits.service').Credit} Credit
 */

/**
 * @typedef {Object} CreditsState
 * @property {Credit[]} list
 * @property {boolean} loading
 * @property {boolean} loaded
 * @property {string} searchQuery
 * @property {'date' | 'amount' | 'name'} sortBy
 * @property {'asc' | 'desc'} sortOrder
 */

/** @type {import('svelte/store').Writable<CreditsState>} */
export const credits = writable({
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
export const filteredCredits = derived(credits, ($credits) => {
  let result = [...$credits.list];

  const query = $credits.searchQuery.toLowerCase().trim();
  if (query) {
    result = result.filter((credit) =>
      credit.person?.name?.toLowerCase().includes(query) ||
      credit.description?.toLowerCase().includes(query)
    );
  }

  result.sort((a, b) => {
    let comparison = 0;

    switch ($credits.sortBy) {
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

    return $credits.sortOrder === 'desc' ? -comparison : comparison;
  });

  return result;
});

/**
 * Statistiques dérivées
 */
export const creditsStats = derived(credits, ($credits) => {
  const active = $credits.list;
  return {
    count: active.length,
    totalAmount: active.reduce((sum, c) => sum + Number(c.total_amount), 0),
    totalRemaining: active.reduce((sum, c) => sum + Number(c.remaining_amount), 0),
    totalReceived: active.reduce((sum, c) => sum + (Number(c.total_amount) - Number(c.remaining_amount)), 0)
  };
});

/**
 * Charger toutes les créances actives
 */
export async function loadCredits() {
  credits.update((state) => ({ ...state, loading: true }));

  try {
    const data = await getCredits();
    credits.update((state) => ({
      ...state,
      list: data,
      loading: false,
      loaded: true
    }));
  } catch (err) {
    credits.update((state) => ({ ...state, loading: false }));
    toastError('Erreur lors du chargement des créances');
    console.error(err);
  }
}

/**
 * Ajouter une créance
 * @param {Parameters<typeof createCredit>[0]} data
 * @returns {Promise<Credit|null>}
 */
export async function addCredit(data) {
  try {
    const newCredit = await createCredit(data);

    credits.update((state) => ({
      ...state,
      list: [newCredit, ...state.list]
    }));

    toastSuccess('Créance ajoutée');
    return newCredit;
  } catch (err) {
    toastError('Erreur lors de l\'ajout de la créance');
    console.error(err);
    return null;
  }
}

/**
 * Modifier une créance
 * @param {string} id
 * @param {Parameters<typeof updateCredit>[1]} data
 * @returns {Promise<Credit|null>}
 */
export async function editCredit(id, data) {
  try {
    const updated = await updateCredit(id, data);

    credits.update((state) => ({
      ...state,
      list: state.list.map((c) => (c.id === id ? updated : c))
    }));

    toastSuccess('Créance modifiée');
    return updated;
  } catch (err) {
    toastError('Erreur lors de la modification');
    console.error(err);
    return null;
  }
}

/**
 * Supprimer une créance
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function removeCredit(id) {
  try {
    await deleteCredit(id);

    credits.update((state) => ({
      ...state,
      list: state.list.filter((c) => c.id !== id)
    }));

    toastSuccess('Créance supprimée');
    return true;
  } catch (err) {
    toastError('Erreur lors de la suppression');
    console.error(err);
    return false;
  }
}

/**
 * Archiver une créance
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function archiveCreditStore(id) {
  try {
    await archiveCredit(id);

    credits.update((state) => ({
      ...state,
      list: state.list.filter((c) => c.id !== id)
    }));

    toastSuccess('Créance archivée');
    return true;
  } catch (err) {
    toastError('Erreur lors de l\'archivage');
    console.error(err);
    return false;
  }
}

/**
 * Restaurer une créance archivée
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function restoreCreditStore(id) {
  try {
    const restored = await restoreCredit(id);

    credits.update((state) => ({
      ...state,
      list: [restored, ...state.list]
    }));

    toastSuccess('Créance restaurée');
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
export function setCreditSearch(query) {
  credits.update((state) => ({ ...state, searchQuery: query }));
}

/**
 * Mettre à jour le tri
 * @param {'date' | 'amount' | 'name'} sortBy
 */
export function setCreditSort(sortBy) {
  credits.update((state) => ({
    ...state,
    sortBy,
    sortOrder: state.sortBy === sortBy && state.sortOrder === 'desc' ? 'asc' : 'desc'
  }));
}

/**
 * Mettre à jour le remaining_amount localement
 * @param {string} id
 * @param {number} newRemaining
 */
export function updateCreditRemaining(id, newRemaining) {
  credits.update((state) => ({
    ...state,
    list: state.list.map((c) =>
      c.id === id
        ? { ...c, remaining_amount: newRemaining, status: newRemaining <= 0 ? 'archived' : 'active' }
        : c
    ).filter((c) => c.status === 'active')
  }));
}