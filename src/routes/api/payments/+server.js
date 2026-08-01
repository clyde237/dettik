import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { clientId } from '$lib/server/request.js';
import { listPayments, createPayment, getPayment } from '$lib/server/queries/payments.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
	const userId = await requireUserId(locals);

	const debtId = url.searchParams.get('debt_id');
	if (!debtId) throw error(400, 'debt_id est obligatoire');

	return json(await listPayments(userId, debtId));
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request }) {
	const userId = await requireUserId(locals);
	const body = await request.json();

	if (!body.debt_id) throw error(400, 'debt_id est obligatoire');
	if (!body.payment_date) throw error(400, 'payment_date est obligatoire');
	if (!body.payment_method) throw error(400, 'payment_method est obligatoire');

	const amount = Number(body.amount);
	if (!Number.isFinite(amount) || amount <= 0) {
		throw error(400, 'amount doit être un nombre positif');
	}

	const result = await createPayment(userId, {
		id: clientId(body.id),
		debt_id: body.debt_id,
		amount,
		payment_date: body.payment_date,
		payment_method: body.payment_method,
		notes: body.notes?.trim() || null
	});

	if (!result.ok) {
		if (result.reason === 'amount_too_high') {
			throw error(400, `Le montant ne peut pas dépasser ${result.remaining}`);
		}
		throw error(404, 'Introuvable');
	}

	const payment = await getPayment(userId, result.paymentId);

	return json({ payment, newRemaining: result.newRemaining }, { status: 201 });
}
