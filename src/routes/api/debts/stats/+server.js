import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { getStats } from '$lib/server/queries/debts.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
	const userId = await requireUserId(locals);

	const type = url.searchParams.get('type') ?? 'debt';
	if (type !== 'debt' && type !== 'credit') {
		throw error(400, 'type doit valoir debt ou credit');
	}

	return json(await getStats(userId, type));
}
