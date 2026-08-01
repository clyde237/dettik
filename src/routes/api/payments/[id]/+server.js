import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { getPayment, deletePayment } from '$lib/server/queries/payments.js';
import { deleteProofFiles } from '$lib/server/blob.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, params }) {
	const userId = await requireUserId(locals);

	const payment = await getPayment(userId, params.id);
	if (!payment) throw error(404, 'Versement introuvable');

	return json(payment);
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ locals, params }) {
	const userId = await requireUserId(locals);

	const result = await deletePayment(userId, params.id);
	if (!result.ok) throw error(404, 'Versement introuvable');

	await deleteProofFiles(result.proofUrls);

	return json({ newRemaining: result.newRemaining });
}
