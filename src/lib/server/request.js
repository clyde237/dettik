import { error } from '@sveltejs/kit';

/**
 * Valide un identifiant fourni par le client lors d'une création.
 *
 * La file de synchronisation hors ligne rejoue des créations déjà identifiées
 * localement : on accepte donc l'ID d'origine, mais uniquement au format UUID
 * généré par crypto.randomUUID().
 *
 * @param {unknown} value
 * @returns {string | undefined}
 */
export function clientId(value) {
	if (value === undefined || value === null || value === '') return undefined;

	if (
		typeof value !== 'string' ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
	) {
		throw error(400, 'id invalide');
	}

	return value;
}
