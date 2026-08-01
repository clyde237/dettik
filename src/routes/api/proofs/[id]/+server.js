import { error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { deleteProof } from '$lib/server/queries/proofs.js';
import { deleteProofFiles } from '$lib/server/blob.js';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ locals, params }) {
	const userId = await requireUserId(locals);

	const proof = await deleteProof(userId, params.id);
	if (!proof) throw error(404, 'Preuve introuvable');

	await deleteProofFiles([String(proof.file_url)]);

	return new Response(null, { status: 204 });
}
