/**
 * Déplace les fichiers preuves de Supabase Storage vers Vercel Blob.
 *
 *   node --env-file=.env scripts/migrate-proofs.mjs
 *
 * À lancer après import-turso.mjs : les lignes payment_proofs portent encore les
 * URLs Supabase, ce script télécharge chaque fichier, le republie sur Vercel Blob
 * en accès privé, puis réécrit file_url en base.
 *
 * Variables nécessaires : TURSO_DATABASE_URL, BLOB_READ_WRITE_TOKEN et — si les
 * URLs signées d'origine ont expiré — SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * pour régénérer un accès au bucket.
 *
 * Rejouable : les preuves déjà servies par Vercel Blob sont ignorées.
 */

import { createClient } from '@libsql/client/web';
import { put } from '@vercel/blob';

const {
	TURSO_DATABASE_URL,
	TURSO_AUTH_TOKEN,
	BLOB_READ_WRITE_TOKEN,
	SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY
} = process.env;

if (!TURSO_DATABASE_URL || !BLOB_READ_WRITE_TOKEN) {
	console.error('TURSO_DATABASE_URL et BLOB_READ_WRITE_TOKEN sont requis dans .env.');
	process.exit(1);
}

const BUCKET = 'payment-proofs';

const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

/**
 * Extrait le chemin du fichier dans le bucket depuis l'URL stockée.
 * Format attendu : .../payment-proofs/<user>/<payment>/<fichier>?token=...
 * @param {string} url
 * @returns {string | null}
 */
function bucketPath(url) {
	const parts = url.split(`${BUCKET}/`);
	if (parts.length < 2) return null;
	return decodeURIComponent(parts[1].split('?')[0]);
}

/**
 * Régénère une URL signée via l'API Storage, l'URL d'origine ayant pu expirer.
 * @param {string} path
 * @returns {Promise<string | null>}
 */
async function signedUrl(path) {
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

	const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${path}`, {
		method: 'POST',
		headers: {
			apikey: SUPABASE_SERVICE_ROLE_KEY,
			Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ expiresIn: 3600 })
	});

	if (!response.ok) return null;

	const body = await response.json();
	return body?.signedURL ? `${SUPABASE_URL}/storage/v1${body.signedURL}` : null;
}

const { rows } = await turso.execute(
	'SELECT id, payment_id, file_url, file_name, file_type FROM payment_proofs'
);

console.log(`${rows.length} preuve(s) en base.\n`);

let moved = 0;
let already = 0;
let failed = 0;

for (const row of rows) {
	const id = String(row.id);
	const currentUrl = String(row.file_url);
	const fileName = String(row.file_name);

	if (
		currentUrl.includes('.public.blob.vercel-storage.com') ||
		currentUrl.includes('blob.vercel')
	) {
		already++;
		continue;
	}

	const path = bucketPath(currentUrl);
	if (!path) {
		console.error(`✗ ${id} : chemin illisible dans ${currentUrl}`);
		failed++;
		continue;
	}

	try {
		// On tente l'URL stockée, puis une URL signée neuve si elle a expiré.
		let response = await fetch(currentUrl);
		if (!response.ok) {
			const fresh = await signedUrl(path);
			if (fresh) response = await fetch(fresh);
		}

		if (!response.ok) {
			console.error(`✗ ${id} : téléchargement impossible (HTTP ${response.status}) — ${path}`);
			failed++;
			continue;
		}

		const blob = await put(`${BUCKET}/${path}`, await response.arrayBuffer(), {
			access: 'private',
			contentType: String(row.file_type),
			token: BLOB_READ_WRITE_TOKEN
		});

		await turso.execute({
			sql: 'UPDATE payment_proofs SET file_url = ? WHERE id = ?',
			args: [blob.url, id]
		});

		moved++;
		console.log(`+ ${fileName} → ${blob.url}`);
	} catch (err) {
		failed++;
		console.error(`✗ ${id} : ${err instanceof Error ? err.message : String(err)}`);
	}
}

console.log(`\nDéplacées : ${moved} | Déjà migrées : ${already} | Échecs : ${failed}`);

if (failed > 0) {
	console.log(
		'\nLes preuves en échec gardent leur URL Supabase : la ligne reste en base, seul\n' +
			"le fichier est inaccessible. Relance le script une fois l'accès au bucket rétabli."
	);
	process.exitCode = 1;
}
