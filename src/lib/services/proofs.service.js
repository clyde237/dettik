import { apiGet, apiUpload, apiDelete } from './api.js';

/**
 * @typedef {Object} Proof
 * @property {string} id
 * @property {string} payment_id
 * @property {string} file_url
 * @property {string} file_name
 * @property {string} file_type
 * @property {number} file_size
 * @property {string} created_at
 */

/**
 * Uploader un fichier preuve
 *
 * Le fichier part vers l'endpoint serveur, qui l'envoie sur Vercel Blob en accès
 * privé puis enregistre la référence en base.
 *
 * @param {string} paymentId
 * @param {File} file
 * @returns {Promise<Proof>}
 */
export function uploadProof(paymentId, file) {
	const formData = new FormData();
	formData.append('payment_id', paymentId);
	formData.append('file', file);

	return apiUpload('/api/proofs', formData);
}

/**
 * Supprimer une preuve (fichier + BDD)
 * @param {Proof} proof
 * @returns {Promise<void>}
 */
export async function deleteProof(proof) {
	await apiDelete(`/api/proofs/${proof.id}`);
}

/**
 * Récupérer les preuves d'un versement
 * @param {string} paymentId
 * @returns {Promise<Proof[]>}
 */
export function getProofs(paymentId) {
	return apiGet('/api/proofs', { payment_id: paymentId });
}

/**
 * URL d'affichage d'une preuve.
 *
 * Les blobs sont privés : le contenu est servi par un endpoint qui contrôle
 * l'accès. C'est cette adresse qu'il faut mettre dans un <img> ou un lien.
 *
 * @param {Proof} proof
 * @returns {string}
 */
export function proofFileUrl(proof) {
	return `/api/proofs/${proof.id}/file`;
}
