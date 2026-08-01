/**
 * Convertit un export CSV d'auth.users en migration-data/users.json.
 *
 *   node scripts/csv-to-users.mjs "C:/chemin/vers/export.csv"
 *
 * Sert d'alternative à export-supabase.mjs quand on n'a pas la connexion
 * Postgres mais un export CSV du tableau de bord Supabase. Le fichier doit
 * contenir au minimum les colonnes id, email et encrypted_password ;
 * created_at est utilisée si elle est présente.
 *
 * La sortie a exactement la forme attendue par import-clerk-users.mjs.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, toRecords, timestamp } from './lib/csv.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migration-data');

const source = process.argv[2];

if (!source) {
	console.error('Usage : node scripts/csv-to-users.mjs <chemin-du-csv>');
	process.exit(1);
}

const path = resolve(source);

if (!existsSync(path)) {
	console.error(`Fichier introuvable : ${path}`);
	process.exit(1);
}

const parsed = parseCsv(readFileSync(path, 'utf8'));

for (const required of ['id', 'email', 'encrypted_password']) {
	if (!parsed.columns.includes(required)) {
		console.error(
			`Colonne « ${required} » absente du CSV. Colonnes lues : ${parsed.columns.join(', ')}`
		);
		process.exit(1);
	}
}

/** @type {any[]} */
const users = [];
let withPassword = 0;
let withoutPassword = 0;

for (const record of toRecords(parsed)) {
	if (!record.id || !record.email) {
		console.warn(
			`! ligne ignorée (id ou email manquant) : ${record.id ?? ''} ${record.email ?? ''}`
		);
		continue;
	}

	if (record.encrypted_password) withPassword++;
	else withoutPassword++;

	users.push({
		id: record.id,
		email: record.email,
		encrypted_password: record.encrypted_password,
		raw_user_meta_data: null,
		created_at: timestamp(record.created_at)
	});
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'users.json'), JSON.stringify(users, null, 2), 'utf8');

console.log(`${users.length} utilisateur(s) écrit(s) dans ${join(OUT_DIR, 'users.json')}`);
console.log(`  avec empreinte de mot de passe   : ${withPassword}`);
console.log(`  sans empreinte (OAuth / OTP)     : ${withoutPassword}`);

if (withoutPassword > 0) {
	console.log(
		`\n⚠ ${withoutPassword} compte(s) sans mot de passe. Leur sort dépend de la configuration\n` +
			"  de l'instance Clerk — voir l'en-tête de import-clerk-users.mjs."
	);
}
