import { writable, derived } from 'svelte/store';
import {
  getPersons,
  createPerson,
  updatePerson,
  deletePerson,
  searchPersons
} from '$lib/services/persons.service';
import { toastSuccess, toastError } from '$lib/stores/notifications';

/**
 * @typedef {Object} Person
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string|null} phone
 * @property {string|null} email
 * @property {string|null} notes
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PersonsState
 * @property {Person[]} list
 * @property {boolean} loading
 * @property {boolean} loaded
 * @property {string} searchQuery
 */

/** @type {import('svelte/store').Writable<PersonsState>} */
export const persons = writable({
  list: [],
  loading: false,
  loaded: false,
  searchQuery: ''
});

/**
 * Liste filtrée par la recherche
 */
export const filteredPersons = derived(persons, ($persons) => {
  const query = $persons.searchQuery.toLowerCase().trim();

  if (!query) return $persons.list;

  return $persons.list.filter((person) =>
    person.name.toLowerCase().includes(query) ||
    person.phone?.toLowerCase().includes(query) ||
    person.email?.toLowerCase().includes(query)
  );
});

/**
 * Charger toutes les personnes depuis Supabase
 */
export async function loadPersons() {
  persons.update((state) => ({ ...state, loading: true }));

  try {
    const data = await getPersons();
    persons.update((state) => ({
      ...state,
      list: data,
      loading: false,
      loaded: true
    }));
  } catch (err) {
    persons.update((state) => ({ ...state, loading: false }));
    toastError('Erreur lors du chargement des personnes');
    console.error(err);
  }
}

/**
 * Ajouter une personne
 * @param {{ name: string, phone?: string, email?: string, notes?: string }} data
 * @returns {Promise<Person|null>}
 */
export async function addPerson(data) {
  try {
    const newPerson = await createPerson(data);

    persons.update((state) => ({
      ...state,
      list: [...state.list, newPerson].sort((a, b) => a.name.localeCompare(b.name))
    }));

    toastSuccess(`${newPerson.name} ajouté(e)`);
    return newPerson;
  } catch (err) {
    toastError('Erreur lors de l\'ajout de la personne');
    console.error(err);
    return null;
  }
}

/**
 * Modifier une personne
 * @param {string} id
 * @param {{ name?: string, phone?: string, email?: string, notes?: string }} data
 * @returns {Promise<Person|null>}
 */
export async function editPerson(id, data) {
  try {
    const updated = await updatePerson(id, data);

    persons.update((state) => ({
      ...state,
      list: state.list
        .map((p) => (p.id === id ? updated : p))
        .sort((a, b) => a.name.localeCompare(b.name))
    }));

    toastSuccess('Personne modifiée');
    return updated;
  } catch (err) {
    toastError('Erreur lors de la modification');
    console.error(err);
    return null;
  }
}

/**
 * Supprimer une personne
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function removePerson(id) {
  try {
    await deletePerson(id);

    persons.update((state) => ({
      ...state,
      list: state.list.filter((p) => p.id !== id)
    }));

    toastSuccess('Personne supprimée');
    return true;
  } catch (err) {
    toastError('Erreur lors de la suppression');
    console.error(err);
    return false;
  }
}

/**
 * Mettre à jour la recherche
 * @param {string} query
 */
export function setSearchQuery(query) {
  persons.update((state) => ({ ...state, searchQuery: query }));
}

/**
 * Rechercher des personnes via Supabase (pour l'autocomplétion)
 * @param {string} query
 * @returns {Promise<Person[]>}
 */
export async function searchPersonsStore(query) {
  try {
    return await searchPersons(query);
  } catch (err) {
    console.error(err);
    return [];
  }
}