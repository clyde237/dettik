import { error } from '@sveltejs/kit';
import { requireUserId } from '$lib/server/auth.js';
import { getProof } from '$lib/server/queries/proofs.js';
import { readProofFile } from '$lib/server/blob.js';

/**
 * Sert le contenu d'un fichier preuve.
 *
 * Les blobs étant privés, leur URL n'est pas consultable directement : ce relais
 * remplace les URLs signées de Supabase Storage. C'est l'adresse à utiliser dans
 * un <img> ou un lien de téléchargement.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ locals, params }) {
	const userId = await requireUserId(locals);

	const proof = await getProof(userId, params.id);
	if (!proof) throw error(404, 'Preuve introuvable');

	const result = await readProofFile(String(proof.file_url));
	if (!result || !result.stream) throw error(404, 'Fichier introuvable');

	return new Response(result.stream, {
		headers: {
			'Content-Type': String(proof.file_type),
			'Content-Length': String(proof.file_size),
			'Content-Disposition': `inline; filename="${encodeURIComponent(String(proof.file_name))}"`,
			// Contenu privé : jamais mis en cache par un intermédiaire partagé.
			'Cache-Control': 'private, max-age=3600'
		}
	});
}
