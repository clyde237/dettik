import { put, del, get } from '@vercel/blob';
import { env } from '$env/dynamic/private';

/**
 * Stockage des fichiers preuves sur Vercel Blob, en remplacement du bucket
 * Supabase Storage « payment-proofs ».
 *
 * Les blobs sont créés en accès privé, comme l'était le bucket : leur URL n'est
 * pas consultable directement. La lecture passe par l'endpoint
 * /api/proofs/[id]/file, qui vérifie que la preuve appartient à l'utilisateur
 * avant de relayer le flux. C'est aussi ce qui rend inutile le rafraîchissement
 * d'URL signée que faisait l'ancien refreshProofUrl().
 *
 * L'arborescence des chemins est conservée (userId/paymentId/timestamp_nom).
 */

/**
 * @param {{ userId: string, paymentId: string, file: File }} params
 * @returns {Promise<{ url: string }>}
 */
export async function uploadProofFile({ userId, paymentId, file }) {
	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
	const pathname = `payment-proofs/${userId}/${paymentId}/${Date.now()}_${safeName}`;

	const blob = await put(pathname, file, {
		access: 'private',
		contentType: file.type,
		token: env.BLOB_READ_WRITE_TOKEN
	});

	return { url: blob.url };
}

/**
 * Ouvre le flux de lecture d'un fichier preuve.
 * @param {string} url
 */
export function readProofFile(url) {
	return get(url, { access: 'private', token: env.BLOB_READ_WRITE_TOKEN });
}

/**
 * Supprime des fichiers preuves.
 *
 * Les erreurs sont avalées volontairement : une preuve déjà absente du stockage
 * ne doit pas empêcher la suppression de la ligne correspondante en base.
 *
 * @param {string[]} urls
 */
export async function deleteProofFiles(urls) {
	const blobUrls = urls.filter((url) => url.startsWith('https://'));
	if (blobUrls.length === 0) return;

	try {
		await del(blobUrls, { token: env.BLOB_READ_WRITE_TOKEN });
	} catch (err) {
		console.error('[Blob] Suppression échouée:', err);
	}
}
