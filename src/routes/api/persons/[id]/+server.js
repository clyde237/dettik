import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { getPerson, updatePerson, deletePerson } from '$lib/server/queries/persons.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, params }) {
	const userId = await requireUserId(locals);

	const person = await getPerson(userId, params.id);
	if (!person) throw error(404, 'Personne introuvable');

	return json(person);
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ locals, params, request }) {
	const userId = await requireUserId(locals);
	const body = await request.json();

	/** @type {Record<string, any>} */
	const updates = {};
	if (body.name !== undefined) {
		const name = body.name.trim();
		if (!name) throw error(400, 'Le nom est obligatoire');
		updates.name = name;
	}
	if (body.phone !== undefined) updates.phone = body.phone?.trim() || null;
	if (body.email !== undefined) updates.email = body.email?.trim() || null;
	if (body.notes !== undefined) updates.notes = body.notes?.trim() || null;

	const person = await updatePerson(userId, params.id, updates);
	if (!person) throw error(404, 'Personne introuvable');

	return json(person);
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ locals, params }) {
	const userId = await requireUserId(locals);

	const result = await deletePerson(userId, params.id);

	if (!result.deleted && result.blocked) {
		throw error(
			409,
			`Cette personne est liée à ${result.blocked} dette(s) ou créance(s) et ne peut pas être supprimée`
		);
	}
	if (!result.deleted) throw error(404, 'Personne introuvable');

	return new Response(null, { status: 204 });
}
