import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { clientId } from '$lib/server/request.js';
import { listDebts, createDebt } from '$lib/server/queries/debts.js';

/**
 * @param {string | null} value
 * @returns {'debt' | 'credit' | undefined}
 */
function parseType(value) {
	if (value === 'debt' || value === 'credit') return value;
	if (value === null) return undefined;
	throw error(400, 'type doit valoir debt ou credit');
}

/**
 * @param {string | null} value
 * @returns {'active' | 'archived' | undefined}
 */
function parseStatus(value) {
	if (value === 'active' || value === 'archived') return value;
	if (value === null) return undefined;
	throw error(400, 'status doit valoir active ou archived');
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
	const userId = await requireUserId(locals);

	const debts = await listDebts(userId, {
		type: parseType(url.searchParams.get('type')),
		status: parseStatus(url.searchParams.get('status'))
	});

	return json(debts);
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request }) {
	const userId = await requireUserId(locals);
	const body = await request.json();

	const type = body.type;
	if (type !== 'debt' && type !== 'credit') {
		throw error(400, 'type doit valoir debt ou credit');
	}
	if (!body.person_id) throw error(400, 'person_id est obligatoire');
	if (!body.loan_date) throw error(400, 'loan_date est obligatoire');

	const totalAmount = Number(body.total_amount);
	if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
		throw error(400, 'total_amount doit être un nombre positif');
	}

	const debt = await createDebt(userId, {
		id: clientId(body.id),
		person_id: body.person_id,
		type,
		total_amount: totalAmount,
		currency: body.currency || 'XAF',
		description: body.description?.trim() || null,
		loan_date: body.loan_date,
		due_date: body.due_date || null,
		interest_rate: body.interest_rate ?? null
	});

	// createDebt renvoie null si la personne n'appartient pas à l'utilisateur.
	if (!debt) throw error(404, 'Personne introuvable');

	return json(debt, { status: 201 });
}
