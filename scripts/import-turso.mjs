/**
 * Importe les données exportées de Supabase dans Turso.
 *
 *   node --env-file=.env scripts/apply-schema.mjs
 *   node --env-file=.env scripts/import-clerk-users.mjs
 *   node --env-file=.env scripts/import-turso.mjs
 *
 * Les user_id sont remappés depuis migration-data/user-map.json : les UUID
 * Supabase deviennent des ID Clerk. Les lignes dont l'utilisateur n'a pas pu être
 * importé sont ignorées et signalées, jamais rattachées au hasard.
 *
 * Rejouable : les insertions sont en INSERT OR REPLACE sur la clé primaire.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client/web';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migration-data');

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL) {
	console.error('TURSO_DATABASE_URL est absent de .env.');
	process.exit(1);
}

const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

/** @param {string} name */
function load(name) {
	const path = join(DATA_DIR, `${name}.json`);
	if (!existsSync(path)) {
		console.error(`${path} est introuvable. Lance d'abord export-supabase.mjs.`);
		process.exit(1);
	}
	return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Normalise un horodatage vers l'ISO 8601 UTC attendu par le schéma.
 * @param {unknown} value
 * @returns {string | null}
 */
function ts(value) {
	if (!value) return null;
	const date = new Date(/** @type {string} */ (value));
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Les colonnes DECIMAL arrivent en chaîne depuis Postgres.
 * @param {unknown} value
 * @returns {number | null}
 */
function num(value) {
	if (value === null || value === undefined || value === '') return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

/** @type {Record<string, string>} */
const userMap = load('user-map');
const profiles = load('profiles');
const persons = load('persons');
const debts = load('debts');
const payments = load('payments');
const proofs = load('payment_proofs');

/** @param {string} supabaseId */
function clerkId(supabaseId) {
	return userMap[supabaseId] ?? null;
}

let skipped = 0;

// ── profiles ────────────────────────────────────────────────────────────────
/** @type {{ sql: string, args: any[] }[]} */
const statements = [];

for (const p of profiles) {
	const id = clerkId(p.id);
	if (!id) {
		console.warn(`! profil ${p.id} ignoré : aucun utilisateur Clerk correspondant`);
		skipped++;
		continue;
	}

	statements.push({
		sql: `INSERT OR REPLACE INTO profiles
            (id, email, full_name, preferred_currency, preferred_language, preferred_theme, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		args: [
			id,
			p.email ?? null,
			p.full_name ?? null,
			p.preferred_currency ?? 'XAF',
			p.preferred_language ?? 'fr',
			p.preferred_theme ?? 'auto',
			ts(p.created_at) ?? new Date().toISOString(),
			ts(p.updated_at) ?? new Date().toISOString()
		]
	});
}

// ── persons ─────────────────────────────────────────────────────────────────
for (const p of persons) {
	const userId = clerkId(p.user_id);
	if (!userId) {
		console.warn(`! personne ${p.id} ignorée : utilisateur ${p.user_id} absent`);
		skipped++;
		continue;
	}

	statements.push({
		sql: `INSERT OR REPLACE INTO persons
            (id, user_id, name, phone, email, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		args: [
			p.id,
			userId,
			p.name,
			p.phone ?? null,
			p.email ?? null,
			p.notes ?? null,
			ts(p.created_at) ?? new Date().toISOString(),
			ts(p.updated_at) ?? new Date().toISOString()
		]
	});
}

// ── debts ───────────────────────────────────────────────────────────────────
const importedDebtIds = new Set();

for (const d of debts) {
	const userId = clerkId(d.user_id);
	if (!userId) {
		console.warn(`! dette ${d.id} ignorée : utilisateur ${d.user_id} absent`);
		skipped++;
		continue;
	}

	importedDebtIds.add(d.id);

	statements.push({
		sql: `INSERT OR REPLACE INTO debts
            (id, user_id, person_id, type, total_amount, remaining_amount, currency,
             description, loan_date, due_date, interest_rate, status, archived_at,
             created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		args: [
			d.id,
			userId,
			d.person_id,
			d.type,
			num(d.total_amount),
			num(d.remaining_amount),
			d.currency ?? 'XAF',
			d.description ?? null,
			d.loan_date,
			d.due_date ?? null,
			num(d.interest_rate),
			d.status ?? 'active',
			ts(d.archived_at),
			ts(d.created_at) ?? new Date().toISOString(),
			ts(d.updated_at) ?? new Date().toISOString()
		]
	});
}

// ── payments ────────────────────────────────────────────────────────────────
const importedPaymentIds = new Set();

for (const p of payments) {
	if (!importedDebtIds.has(p.debt_id)) {
		console.warn(`! versement ${p.id} ignoré : dette ${p.debt_id} non importée`);
		skipped++;
		continue;
	}

	importedPaymentIds.add(p.id);

	statements.push({
		sql: `INSERT OR REPLACE INTO payments
            (id, debt_id, amount, payment_date, payment_method, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		args: [
			p.id,
			p.debt_id,
			num(p.amount),
			p.payment_date,
			p.payment_method,
			p.notes ?? null,
			ts(p.created_at) ?? new Date().toISOString(),
			ts(p.updated_at) ?? new Date().toISOString()
		]
	});
}

// ── payment_proofs ──────────────────────────────────────────────────────────
// file_url pointe encore vers Supabase Storage à ce stade ; migrate-proofs.mjs
// déplace les fichiers vers Vercel Blob et réécrit ces URLs.
for (const p of proofs) {
	if (!importedPaymentIds.has(p.payment_id)) {
		console.warn(`! preuve ${p.id} ignorée : versement ${p.payment_id} non importé`);
		skipped++;
		continue;
	}

	statements.push({
		sql: `INSERT OR REPLACE INTO payment_proofs
            (id, payment_id, file_url, file_name, file_type, file_size, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
		args: [
			p.id,
			p.payment_id,
			p.file_url,
			p.file_name,
			p.file_type,
			Number(p.file_size) || 0,
			ts(p.created_at) ?? new Date().toISOString()
		]
	});
}

// ── écriture ────────────────────────────────────────────────────────────────
console.log(`\n${statements.length} insertion(s) à appliquer...`);

// Par lots, pour ne pas dépasser la taille de requête acceptée par Turso.
const CHUNK = 100;
for (let i = 0; i < statements.length; i += CHUNK) {
	const chunk = statements.slice(i, i + CHUNK);
	await turso.batch([{ sql: 'PRAGMA foreign_keys = ON', args: [] }, ...chunk], 'write');
	process.stdout.write(`\r  ${Math.min(i + CHUNK, statements.length)}/${statements.length}`);
}

console.log('\n');

for (const table of ['profiles', 'persons', 'debts', 'payments', 'payment_proofs']) {
	const result = await turso.execute(`SELECT COUNT(*) AS total FROM ${table}`);
	console.log(`  ${table.padEnd(16)} ${result.rows[0].total} ligne(s)`);
}

if (skipped > 0)
	console.log(`\n⚠ ${skipped} ligne(s) ignorée(s), voir les avertissements ci-dessus.`);
console.log('\nImport terminé. Prochaine étape : scripts/migrate-proofs.mjs');
