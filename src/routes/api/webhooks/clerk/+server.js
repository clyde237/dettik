import { error, json } from '@sveltejs/kit';
import { verifyWebhook } from 'svelte-clerk/webhooks';
import { deleteUserData, updateProfile } from '$lib/server/queries/profiles.js';
import { ensureProfile } from '$lib/server/auth.js';
import { deleteProofFiles } from '$lib/server/blob.js';

/**
 * Webhook Clerk.
 *
 * Reprend ce que les triggers Postgres faisaient sur auth.users :
 *  - user.created : création de la ligne profiles (ex-trigger on_auth_user_created)
 *  - user.deleted : purge en cascade des données (ex-ON DELETE CASCADE)
 *
 * À configurer dans le tableau de bord Clerk sur /api/webhooks/clerk, avec
 * CLERK_WEBHOOK_SIGNING_SECRET côté environnement.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	/** @type {import('svelte-clerk/webhooks').WebhookEvent} */
	let event;

	try {
		event = await verifyWebhook(request);
	} catch (err) {
		console.error('[Webhook Clerk] Signature invalide:', err);
		throw error(400, 'Signature invalide');
	}

	switch (event.type) {
		case 'user.created': {
			const email =
				event.data.email_addresses?.find((e) => e.id === event.data.primary_email_address_id)
					?.email_address ??
				event.data.email_addresses?.[0]?.email_address ??
				null;

			const fullName = [event.data.first_name, event.data.last_name]
				.filter(Boolean)
				.join(' ')
				.trim();

			await ensureProfile(event.data.id);
			await updateProfile(event.data.id, { email, full_name: fullName || null });
			break;
		}

		case 'user.deleted': {
			if (!event.data.id) break;
			const { proofUrls } = await deleteUserData(event.data.id);
			await deleteProofFiles(proofUrls);
			break;
		}
	}

	return json({ received: true });
}
