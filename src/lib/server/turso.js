import { createClient } from '@libsql/client/web';
import { env } from '$env/dynamic/private';

/**
 * Client Turso (libSQL).
 *
 * Ce module vit sous $lib/server/ : SvelteKit refuse qu'il soit importé depuis
 * du code client. C'est volontaire — le token Turso donne un accès complet à la
 * base, il ne doit jamais atteindre le navigateur.
 *
 * L'import vient de @libsql/client/web et non de la racine du paquet : la base
 * est distante, tout passe par HTTP, et cette variante évite d'embarquer le
 * binaire natif libsql dans la fonction serverless. Elle expose bien execute,
 * batch et transaction, les trois seules primitives utilisées ici.
 *
 * À savoir sur les clés étrangères : SQLite les désactive par défaut, et Turso
 * suit cette convention. Or chaque appel à client.execute() part sur sa propre
 * connexion logique, donc un « PRAGMA foreign_keys = ON » envoyé seul ne
 * s'applique à rien. Le pragma n'a d'effet que dans un batch ou une transaction,
 * qui tiennent une connexion unique — d'où les helpers batch()/transaction()
 * ci-dessous. Les invariants qui comptent (RESTRICT sur persons, cascades sur
 * debts et payments) sont en plus appliqués explicitement en SQL dans
 * src/lib/server/queries/, pour ne pas dépendre du pragma.
 */
/** @type {import('@libsql/client').Client | null} */
let client = null;

/**
 * Le client est créé à la première requête, pas au chargement du module :
 * SvelteKit importe les modules serveur pendant l'analyse des routes au build,
 * moment où les variables d'environnement ne sont pas nécessairement présentes.
 *
 * @returns {import('@libsql/client').Client}
 */
export function turso() {
	if (client) return client;

	if (!env.TURSO_DATABASE_URL) {
		throw new Error('TURSO_DATABASE_URL est absent de la configuration');
	}

	client = createClient({
		url: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN
	});

	return client;
}

const ENABLE_FOREIGN_KEYS = 'PRAGMA foreign_keys = ON';

/**
 * Exécute une requête et renvoie toutes les lignes sous forme d'objets.
 * @param {string} sql
 * @param {import('@libsql/client').InArgs} [args]
 * @returns {Promise<Record<string, any>[]>}
 */
export async function query(sql, args = []) {
	const result = await turso().execute({ sql, args });
	return result.rows.map((row) => ({ ...row }));
}

/**
 * Exécute une requête et renvoie la première ligne, ou null.
 * @param {string} sql
 * @param {import('@libsql/client').InArgs} [args]
 * @returns {Promise<Record<string, any> | null>}
 */
export async function queryOne(sql, args = []) {
	const rows = await query(sql, args);
	return rows[0] ?? null;
}

/**
 * Exécute une écriture isolée.
 *
 * Les clés étrangères ne sont pas appliquées ici (connexion logique dédiée) :
 * à réserver aux écritures qui ne dépendent d'aucune contrainte référentielle.
 *
 * @param {string} sql
 * @param {import('@libsql/client').InArgs} [args]
 */
export function execute(sql, args = []) {
	return turso().execute({ sql, args });
}

/**
 * Exécute plusieurs requêtes atomiquement, clés étrangères activées.
 * @param {{ sql: string, args?: import('@libsql/client').InArgs }[]} statements
 */
export async function batch(statements) {
	const results = await turso().batch(
		[
			{ sql: ENABLE_FOREIGN_KEYS, args: [] },
			...statements.map(({ sql, args = [] }) => ({ sql, args }))
		],
		'write'
	);

	// On retire le résultat du PRAGMA pour que les index correspondent à l'entrée.
	return results.slice(1);
}

/**
 * Ouvre une transaction interactive en écriture, clés étrangères activées.
 *
 * L'appelant doit impérativement fermer la transaction (commit, rollback ou
 * close) — au mieux via un bloc finally.
 *
 * @returns {Promise<import('@libsql/client').Transaction>}
 */
export async function transaction() {
	const tx = await turso().transaction('write');
	await tx.execute(ENABLE_FOREIGN_KEYS);
	return tx;
}

/** Horodatage ISO 8601 UTC, au format utilisé par toutes les colonnes de dates. */
export function now() {
	return new Date().toISOString();
}
