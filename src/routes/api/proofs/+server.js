import { json, error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { listProofs, createProof, ownsPayment } from '$lib/server/queries/proofs.js';
import { uploadProofFile } from '$lib/server/blob.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
	const userId = await requireUserId(locals);

	const paymentId = url.searchParams.get('payment_id');
	if (!paymentId) throw error(400, 'payment_id est obligatoire');

	return json(await listProofs(userId, paymentId));
}

/**
 * Upload d'une preuve : le fichier part sur Vercel Blob, la référence en base.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ locals, request }) {
	const userId = await requireUserId(locals);

	const form = await request.formData();
	const paymentId = form.get('payment_id');
	const file = form.get('file');

	if (typeof paymentId !== 'string' || !paymentId) {
		throw error(400, 'payment_id est obligatoire');
	}
	if (!(file instanceof File)) {
		throw error(400, 'Aucun fichier reçu');
	}

	// Le versement doit appartenir à l'utilisateur avant tout envoi de fichier.
	if (!(await ownsPayment(userId, paymentId))) {
		throw error(404, 'Versement introuvable');
	}

	const { url } = await uploadProofFile({ userId, paymentId, file });

	const proof = await createProof(userId, paymentId, {
		file_url: url,
		file_name: file.name,
		file_type: file.type,
		file_size: file.size
	});

	return json(proof, { status: 201 });
}
