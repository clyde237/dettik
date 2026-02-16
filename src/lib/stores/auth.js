import { writable } from 'svelte/store';

/**
 * @typedef {Object} AuthState
 * @property {import('@supabase/supabase-js').User | null} user
 * @property {import('@supabase/supabase-js').Session | null} session
 * @property {Record<string, any> | null} profile
 * @property {boolean} loading
 */

/** @type {import('svelte/store').Writable<AuthState>} */
export const auth = writable({
  user: null,
  session: null,
  profile: null,
  loading: true
});

/**
 * Met à jour la session dans le store
 * @param {import('@supabase/supabase-js').Session | null} session
 */
export function setSession(session) {
  auth.update((state) => ({
    ...state,
    session,
    user: session?.user ?? null,
    loading: false
  }));
}

/**
 * Met à jour le profil dans le store
 * @param {Record<string, any> | null} profile
 */
export function setProfile(profile) {
  auth.update((state) => ({
    ...state,
    profile
  }));
}

/**
 * Réinitialise le store (déconnexion)
 */
export function clearAuth() {
  auth.set({
    user: null,
    session: null,
    profile: null,
    loading: false
  });
}