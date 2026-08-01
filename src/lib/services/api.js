/**
 * Client HTTP vers les endpoints /api de l'application.
 *
 * Les services parlaient auparavant directement à PostgREST depuis le
 * navigateur, protégés par les RLS. Turso n'a pas d'équivalent et son token ne
 * doit pas quitter le serveur : toutes les requêtes passent donc par nos propres
 * endpoints, qui filtrent sur l'utilisateur Clerk connecté.
 */

/**
 * Extrait le message d'erreur renvoyé par SvelteKit (error(status, message)).
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function errorMessage(response) {
	try {
		const body = await response.json();
		return body?.message || `Erreur ${response.status}`;
	} catch {
		return `Erreur ${response.status}`;
	}
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
	const response = await fetch(path, options);

	if (!response.ok) {
		throw new Error(await errorMessage(response));
	}

	if (response.status === 204) return null;
	return response.json();
}

/**
 * @param {string} path
 * @param {Record<string, string | undefined | null>} [params]
 */
export function apiGet(path, params) {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(params ?? {})) {
		if (value !== undefined && value !== null) query.set(key, value);
	}

	const suffix = query.size > 0 ? `?${query}` : '';
	return request(`${path}${suffix}`);
}

/**
 * @param {string} path
 * @param {unknown} body
 */
export function apiPost(path, body) {
	return request(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

/**
 * @param {string} path
 * @param {unknown} body
 */
export function apiPatch(path, body) {
	return request(path, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

/**
 * @param {string} path
 */
export function apiDelete(path) {
	return request(path, { method: 'DELETE' });
}

/**
 * Envoi multipart, pour les fichiers preuves.
 * @param {string} path
 * @param {FormData} formData
 */
export function apiUpload(path, formData) {
	return request(path, { method: 'POST', body: formData });
}
