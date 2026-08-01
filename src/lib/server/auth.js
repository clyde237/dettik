import { error } from '@sveltejs/kit';
import { execute } from './turso.js';

/**
 * Profils dont on sait déjà qu'ils existent, pour éviter un aller-retour
 * Turso à chaque requête. Le cache est local à l'instance serverless.
 * @type {Set<string>}
 */
const knownProfiles = new Set();

/**
 * Crée la ligne profiles si elle n'existe pas encore.
 *
 * Remplace le trigger on_auth_user_created de Supabase : c'est cette ligne qui
 * porte le ON DELETE CASCADE dont dépendent persons, debts, payments et proofs.
 *
 * @param {string} userId ID utilisateur Clerk
 */
export async function ensureProfile(userId) {
	if (knownProfiles.has(userId)) return;
	await execute('INSERT OR IGNORE INTO profiles (id) VALUES (?)', [userId]);
	knownProfiles.add(userId);
}

/**
 * Récupère l'ID de l'utilisateur connecté, ou renvoie une 401.
 *
 * À appeler dans chaque endpoint : sans RLS, c'est cet ID qui cloisonne les
 * données, et toute requête doit filtrer dessus.
 *
 * @param {App.Locals} locals
 * @returns {Promise<string>}
 */
export async function requireUserId(locals) {
	const { userId } = locals.auth();
	if (!userId) throw error(401, 'Non connecté');
	await ensureProfile(userId);
	return userId;
}
