import { apiGet, apiPost, apiPatch, apiDelete } from './api.js';

/**
 * Récupérer toutes les personnes de l'utilisateur connecté
 * @returns {Promise<Array>}
 */
export function getPersons() {
	return apiGet('/api/persons');
}

/**
 * Récupérer une personne par son ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export function getPerson(id) {
	return apiGet(`/api/persons/${id}`);
}

/**
 * Rechercher des personnes par nom (autocomplétion)
 * @param {string} query
 * @returns {Promise<Array>}
 */
export function searchPersons(query) {
	if (!query || query.trim().length < 1) {
		return getPersons();
	}

	return apiGet('/api/persons', { q: query.trim() });
}

/**
 * Créer une nouvelle personne
 * @param {{ name: string, phone?: string, email?: string, notes?: string }} params
 * @returns {Promise<Object>}
 */
export function createPerson({ name, phone, email, notes }) {
	return apiPost('/api/persons', { name, phone, email, notes });
}

/**
 * Mettre à jour une personne
 * @param {string} id
 * @param {{ name?: string, phone?: string, email?: string, notes?: string }} updates
 * @returns {Promise<Object>}
 */
export function updatePerson(id, updates) {
	return apiPatch(`/api/persons/${id}`, updates);
}

/**
 * Supprimer une personne
 * @param {string} id
 */
export async function deletePerson(id) {
	await apiDelete(`/api/persons/${id}`);
}

/**
 * Vérifier si une personne avec ce nom existe déjà
 * @param {string} name
 * @returns {Promise<Object|null>}
 */
export function findPersonByName(name) {
	return apiGet('/api/persons', { name: name.trim() });
}
