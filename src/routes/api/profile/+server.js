import { json } from '@sveltejs/kit';
import { clerkClient } from 'svelte-clerk/server';
import { requireUserId } from '$lib/server/auth.js';
import { getProfile, updateProfile } from '$lib/server/queries/profiles.js';

/**
 * Renvoie le profil applicatif.
 *
 * L'email est détenu par Clerk, pas par la base : on le récupère à la lecture et
 * on le recopie dans profiles pour que la colonne reste exploitable (exports,
 * scripts). full_name et les préférences restent purement locaux, comme dans le
 * schéma Supabase d'origine.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ locals }) {
	const userId = await requireUserId(locals);

	let profile = await getProfile(userId);

	if (!profile?.email) {
		try {
			const user = await clerkClient.users.getUser(userId);
			const email =
				user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
				user.emailAddresses[0]?.emailAddress ??
				null;

			if (email) profile = await updateProfile(userId, { email });
		} catch (err) {
			console.error('[Profile] Lecture Clerk échouée:', err);
		}
	}

	return json(profile);
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ locals, request }) {
	const userId = await requireUserId(locals);
	const body = await request.json();

	/** @type {Record<string, any>} */
	const updates = {};
	if (body.full_name !== undefined) updates.full_name = body.full_name?.trim() || null;
	if (body.preferred_currency !== undefined) updates.preferred_currency = body.preferred_currency;
	if (body.preferred_language !== undefined) updates.preferred_language = body.preferred_language;
	if (body.preferred_theme !== undefined) updates.preferred_theme = body.preferred_theme;

	return json(await updateProfile(userId, updates));
}
