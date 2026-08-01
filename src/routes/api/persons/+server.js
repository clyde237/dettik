import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { clientId } from '$lib/server/request.js';
import {
	listPersons,
	searchPersons,
	findPersonByName,
	createPerson
} from '$lib/server/queries/persons.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
	const userId = await requireUserId(locals);

	// ?name= : recherche exacte (findPersonByName), renvoie un objet ou null
	const exactName = url.searchParams.get('name');
	if (exactName !== null) {
		return json(await findPersonByName(userId, exactName.trim()));
	}

	// ?q= : autocomplétion
	const search = url.searchParams.get('q')?.trim();
	if (search) {
		return json(await searchPersons(userId, search));
	}

	return json(await listPersons(userId));
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request }) {
	const userId = await requireUserId(locals);
	const body = await request.json();

	const name = body.name?.trim();
	if (!name) throw error(400, 'Le nom est obligatoire');

	const person = await createPerson(userId, {
		id: clientId(body.id),
		name,
		phone: body.phone?.trim() || null,
		email: body.email?.trim() || null,
		notes: body.notes?.trim() || null
	});

	return json(person, { status: 201 });
}
