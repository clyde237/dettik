import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * ID de l'utilisateur connecté, accessible hors composant.
 *
 * Les stores lisaient auparavant supabase.auth.getUser() pour filtrer le cache
 * IndexedDB. Clerk n'expose son instance que via le contexte Svelte, inutilisable
 * depuis un module ordinaire — et hors ligne il n'y a de toute façon aucun appel
 * réseau possible. L'ID est donc renseigné par le layout applicatif et recopié
 * dans localStorage pour survivre à un rechargement hors ligne.
 */

const STORAGE_KEY = 'dettik:user_id';

/** @type {import('svelte/store').Writable<string | null>} */
export const currentUserId = writable(browser ? localStorage.getItem(STORAGE_KEY) : null);

/**
 * @param {string | null | undefined} userId
 */
export function setCurrentUserId(userId) {
	const value = userId ?? null;
	currentUserId.set(value);

	if (!browser) return;
	if (value) localStorage.setItem(STORAGE_KEY, value);
	else localStorage.removeItem(STORAGE_KEY);
}

/**
 * @returns {string | null}
 */
export function getCurrentUserId() {
	return get(currentUserId);
}
