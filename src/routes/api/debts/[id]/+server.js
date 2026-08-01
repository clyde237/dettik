import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { getDebt, updateDebt, deleteDebt } from '$lib/server/queries/debts.js';
import { deleteProofFiles } from '$lib/server/blob.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, params }) {
	const userId = await requireUserId(locals);

	const debt = await getDebt(userId, params.id);
	if (!debt) throw error(404, 'Introuvable');

	return json(debt);
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ locals, params, request }) {
	const userId = await requireUserId(locals);
	const body = await request.json();

	/** @type {Record<string, any>} */
	const updates = {};

	if (body.person_id !== undefined) updates.person_id = body.person_id;
	if (body.currency !== undefined) updates.currency = body.currency;
	if (body.loan_date !== undefined) updates.loan_date = body.loan_date;
	if (body.due_date !== undefined) updates.due_date = body.due_date || null;
	if (body.description !== undefined) updates.description = body.description?.trim() || null;
	if (body.interest_rate !== undefined) updates.interest_rate = body.interest_rate || null;

	if (body.total_amount !== undefined) {
		const totalAmount = Number(body.total_amount);
		if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
			throw error(400, 'total_amount doit être un nombre positif');
		}
		updates.total_amount = totalAmount;
	}

	if (body.status !== undefined) {
		if (body.status !== 'active' && body.status !== 'archived') {
			throw error(400, 'status doit valoir active ou archived');
		}
		updates.status = body.status;
		// L'horodatage d'archivage suit le statut, sauf s'il est fourni explicitement.
		if (body.archived_at === undefined) {
			updates.archived_at = body.status === 'archived' ? new Date().toISOString() : null;
		}
	}
	if (body.archived_at !== undefined) updates.archived_at = body.archived_at || null;

	const debt = await updateDebt(userId, params.id, updates);
	if (!debt) throw error(404, 'Introuvable');

	return json(debt);
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ locals, params }) {
	const userId = await requireUserId(locals);

	const { deleted, proofUrls } = await deleteDebt(userId, params.id);
	if (!deleted) throw error(404, 'Introuvable');

	await deleteProofFiles(proofUrls);

	return new Response(null, { status: 204 });
}
