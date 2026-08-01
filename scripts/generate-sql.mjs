/**
 * Génère migration-data/insert-data.sql à partir des JSON de migration-data.
 *
 *   node scripts/generate-sql.mjs
 *
 * Le fichier produit est exécutable tel quel dans la console web Turso ou via
 * « turso db shell dettik-db < migration-data/insert-data.sql ».
 *
 * Deux choses que ce script fait et qu'un INSERT écrit à la main depuis les CSV
 * ne ferait pas :
 *
 *  1. Le remappage des user_id. Les CSV Supabase portent des UUID d'auth.users,
 *     alors que profiles.id contient désormais l'identifiant Clerk. Sans cette
 *     substitution la base serait pleine mais aucun utilisateur ne verrait ses
 *     données, l'application interrogeant Turso par identifiant Clerk.
 *
 *  2. Le contrôle d'intégrité avant émission : chaque person_id doit exister
 *     dans persons, chaque debt_id dans debts. Une ligne orpheline est écartée
 *     et signalée plutôt qu'insérée en violation des clés étrangères.
 *
 * L'ordre d'insertion suit les dépendances : profiles, persons, debts, payments,
 * payment_proofs.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migration-data');
const OUT_FILE = join(DATA_DIR, 'insert-data.sql');

/** @param {string} name */
function load(name) {
	const path = join(DATA_DIR, `${name}.json`);
	if (!existsSync(path)) {
		console.error(`${path} est introuvable.`);
		process.exit(1);
	}
	return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Littéral SQL. Les apostrophes sont doublées ; SQLite accepte les retours à la
 * ligne bruts dans une chaîne, ce qui préserve les notes multi-lignes.
 * @param {unknown} value
 * @returns {string}
 */
function text(value) {
	if (value === null || value === undefined || value === '') return 'NULL';
	return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Littéral numérique, sans guillemets pour que l'affinité NUMERIC s'applique.
 * @param {unknown} value
 * @returns {string}
 */
function number(value) {
	if (value === null || value === undefined || value === '') return 'NULL';
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return 'NULL';
	return String(parsed);
}

/** @type {Record<string, string>} */
const userMap = load('user-map');
const profiles = load('profiles');
const persons = load('persons');
const debts = load('debts');
const payments = load('payments');
const proofs = load('payment_proofs');

/** @param {string} supabaseId */
const clerkId = (supabaseId) => userMap[supabaseId] ?? null;

const lines = [];
const warnings = [];

lines.push('-- Données dettik migrées de Supabase vers Turso');
lines.push(`-- Généré le ${new Date().toISOString()}`);
lines.push('--');
lines.push('-- Les user_id ont été remplacés par les identifiants Clerk correspondants.');
lines.push('-- Rejouable : INSERT OR REPLACE sur la clé primaire.');
lines.push('');
lines.push('PRAGMA foreign_keys = ON;');
lines.push('');
lines.push('BEGIN TRANSACTION;');
lines.push('');

// ── profiles ────────────────────────────────────────────────────────────────
const keptProfiles = new Set();
lines.push('-- profiles');

for (const p of profiles) {
	const id = clerkId(p.id);
	if (!id) {
		warnings.push(`profil ${p.email ?? p.id} écarté : aucun utilisateur Clerk correspondant`);
		continue;
	}
	keptProfiles.add(p.id);

	lines.push(
		`INSERT OR REPLACE INTO profiles (id, email, full_name, preferred_currency, preferred_language, preferred_theme, created_at, updated_at) VALUES (` +
			[
				text(id),
				text(p.email),
				text(p.full_name),
				text(p.preferred_currency ?? 'XAF'),
				text(p.preferred_language ?? 'fr'),
				text(p.preferred_theme ?? 'auto'),
				text(p.created_at),
				text(p.updated_at)
			].join(', ') +
			');'
	);
}

// ── persons ─────────────────────────────────────────────────────────────────
const keptPersons = new Set();
lines.push('');
lines.push('-- persons');

for (const p of persons) {
	if (!keptProfiles.has(p.user_id)) {
		warnings.push(`personne ${p.name} écartée : profil ${p.user_id} absent`);
		continue;
	}
	keptPersons.add(p.id);

	lines.push(
		`INSERT OR REPLACE INTO persons (id, user_id, name, phone, email, notes, created_at, updated_at) VALUES (` +
			[
				text(p.id),
				text(clerkId(p.user_id)),
				text(p.name),
				text(p.phone),
				text(p.email),
				text(p.notes),
				text(p.created_at),
				text(p.updated_at)
			].join(', ') +
			');'
	);
}

// ── debts ───────────────────────────────────────────────────────────────────
const keptDebts = new Set();
lines.push('');
lines.push('-- debts');

for (const d of debts) {
	if (!keptProfiles.has(d.user_id)) {
		warnings.push(`dette ${d.id} écartée : profil ${d.user_id} absent`);
		continue;
	}
	if (!keptPersons.has(d.person_id)) {
		warnings.push(`dette ${d.id} écartée : personne ${d.person_id} absente`);
		continue;
	}
	keptDebts.add(d.id);

	lines.push(
		`INSERT OR REPLACE INTO debts (id, user_id, person_id, type, total_amount, remaining_amount, currency, description, loan_date, due_date, interest_rate, status, archived_at, created_at, updated_at) VALUES (` +
			[
				text(d.id),
				text(clerkId(d.user_id)),
				text(d.person_id),
				text(d.type),
				number(d.total_amount),
				number(d.remaining_amount),
				text(d.currency ?? 'XAF'),
				text(d.description),
				text(d.loan_date),
				text(d.due_date),
				number(d.interest_rate),
				text(d.status ?? 'active'),
				text(d.archived_at),
				text(d.created_at),
				text(d.updated_at)
			].join(', ') +
			');'
	);
}

// ── payments ────────────────────────────────────────────────────────────────
const keptPayments = new Set();
lines.push('');
lines.push('-- payments');

for (const p of payments) {
	if (!keptDebts.has(p.debt_id)) {
		warnings.push(`versement ${p.id} écarté : dette ${p.debt_id} absente`);
		continue;
	}
	keptPayments.add(p.id);

	lines.push(
		`INSERT OR REPLACE INTO payments (id, debt_id, amount, payment_date, payment_method, notes, created_at, updated_at) VALUES (` +
			[
				text(p.id),
				text(p.debt_id),
				number(p.amount),
				text(p.payment_date),
				text(p.payment_method),
				text(p.notes),
				text(p.created_at),
				text(p.updated_at)
			].join(', ') +
			');'
	);
}

// ── payment_proofs ──────────────────────────────────────────────────────────
lines.push('');
lines.push('-- payment_proofs');

if (proofs.length === 0) {
	lines.push('-- (aucune preuve à insérer)');
}

for (const p of proofs) {
	if (!keptPayments.has(p.payment_id)) {
		warnings.push(`preuve ${p.id} écartée : versement ${p.payment_id} absent`);
		continue;
	}

	lines.push(
		`INSERT OR REPLACE INTO payment_proofs (id, payment_id, file_url, file_name, file_type, file_size, created_at) VALUES (` +
			[
				text(p.id),
				text(p.payment_id),
				text(p.file_url),
				text(p.file_name),
				text(p.file_type),
				number(p.file_size ?? 0),
				text(p.created_at)
			].join(', ') +
			');'
	);
}

lines.push('');
lines.push('COMMIT;');
lines.push('');

writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');

console.log(`SQL écrit dans ${OUT_FILE}\n`);
console.log(`  profiles        ${keptProfiles.size} / ${profiles.length}`);
console.log(`  persons         ${keptPersons.size} / ${persons.length}`);
console.log(`  debts           ${keptDebts.size} / ${debts.length}`);
console.log(`  payments        ${keptPayments.size} / ${payments.length}`);
console.log(`  payment_proofs  ${proofs.length} / ${proofs.length}`);

if (warnings.length > 0) {
	console.log(`\n⚠ ${warnings.length} ligne(s) écartée(s) :`);
	for (const warning of warnings) console.log(`    ${warning}`);
	process.exitCode = 1;
}
