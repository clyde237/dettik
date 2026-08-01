/**
 * Exporte les données Supabase vers migration-data/*.json.
 *
 *   node --env-file=.env scripts/export-supabase.mjs
 *
 * Nécessite SUPABASE_DB_URL, la chaîne de connexion Postgres complète :
 *   Tableau de bord Supabase > Project Settings > Database > Connection string
 *   postgresql://postgres.<ref>:<mot-de-passe>@<hôte>.pooler.supabase.com:5432/postgres
 *
 * On passe par une connexion Postgres directe et non par l'API REST, parce que
 * les empreintes de mots de passe vivent dans auth.users, table que PostgREST
 * n'expose pas. Sans elles, tous les comptes devraient réinitialiser leur mot de
 * passe après la bascule vers Clerk.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migration-data');

const { SUPABASE_DB_URL } = process.env;

if (!SUPABASE_DB_URL) {
	console.error(
		'SUPABASE_DB_URL est absent.\n' +
			'Ajoute la chaîne de connexion Postgres du projet Supabase actif dans .env.'
	);
	process.exit(1);
}

// Les colonnes DATE doivent rester des chaînes « YYYY-MM-DD » : le parseur par
// défaut de pg les convertit en Date dans le fuseau local, ce qui décale les
// dates d'un jour selon l'heure. OID 1082 = date, 1114/1184 = timestamp(tz).
pg.types.setTypeParser(1082, (value) => value);

const client = new pg.Client({
	connectionString: SUPABASE_DB_URL,
	ssl: { rejectUnauthorized: false }
});

/**
 * @param {string} name
 * @param {string} sql
 */
async function dump(name, sql) {
	const { rows } = await client.query(sql);
	writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(rows, null, 2), 'utf8');
	console.log(`  ${name.padEnd(16)} ${rows.length} ligne(s)`);
	return rows.length;
}

mkdirSync(OUT_DIR, { recursive: true });

await client.connect();
console.log('Connecté au Postgres Supabase.\n');

try {
	await dump(
		'users',
		`SELECT id, email, encrypted_password, raw_user_meta_data, created_at
       FROM auth.users
      ORDER BY created_at`
	);

	await dump('profiles', 'SELECT * FROM public.profiles ORDER BY created_at');
	await dump('persons', 'SELECT * FROM public.persons ORDER BY created_at');
	await dump('debts', 'SELECT * FROM public.debts ORDER BY created_at');
	await dump('payments', 'SELECT * FROM public.payments ORDER BY created_at');
	await dump('payment_proofs', 'SELECT * FROM public.payment_proofs ORDER BY created_at');

	console.log(`\nExport terminé dans ${OUT_DIR}`);
	console.log('⚠ Ces fichiers contiennent des empreintes de mots de passe : à ne pas committer.');
} finally {
	await client.end();
}
