import { withClerkHandler } from 'svelte-clerk/server';

/**
 * Authentifie chaque requête et expose event.locals.auth().
 * Remplace le handler Supabase qui instanciait un client par requête.
 *
 * @type {import('@sveltejs/kit').Handle}
 */
export const handle = withClerkHandler();
