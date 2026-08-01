/**
 * Convertit les exports CSV des tables métier en migration-data/<table>.json.
 *
 *   node scripts/csv-to-tables.mjs debts="C:/chemin/debts.csv" persons="C:/chemin/persons.csv"
 *   node scripts/csv-to-tables.mjs "C:/chemin/dossier"        (cherche <table>.csv dedans)
 *
 * Alternative à export-supabase.mjs quand on n'a pas la connexion Postgres mais
 * l'éditeur SQL du tableau de bord Supabase. La sortie a exactement la même forme
 * que celle de l'export Postgres, si bien qu'import-turso.mjs ne fait pas la
 * différence entre les deux voies.
 *
 * Tables reconnues : profiles, persons, debts, payments, payment_proofs.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, toRecords, timestamp } from './lib/csv.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migration-data');

/**
 * Colonnes attendues par import-turso.mjs, et lesquelles sont des horodatages.
 *
 * Les colonnes de type DATE (loan_date, due_date, payment_date) sont laissées
 * telles quelles, au format « YYYY-MM-DD » : les convertir en Date décalerait la
 * journée selon le fuseau. Les montants restent des chaînes, comme ce que renvoie
 * le pilote Postgres pour du NUMERIC ; import-turso.mjs les convertit ensuite.
 */
const TABLES = {
	profiles: {
		required: ['id'],
		columns: [
			'id',
			'email',
			'full_name',
			'preferred_currency',
			'preferred_language',
			'preferred_theme',
			'created_at',
			'updated_at'
		],
		timestamps: ['created_at', 'updated_at']
	},
	persons: {
		required: ['id', 'user_id', 'name'],
		columns: ['id', 'user_id', 'name', 'phone', 'email', 'notes', 'created_at', 'updated_at'],
		timestamps: ['created_at', 'updated_at']
	},
	debts: {
		required: ['id', 'user_id', 'person_id', 'type', 'total_amount', 'loan_date'],
		columns: [
			'id',
			'user_id',
			'person_id',
			'type',
			'total_amount',
			'remaining_amount',
			'currency',
			'description',
			'loan_date',
			'due_date',
			'interest_rate',
			'status',
			'archived_at',
			'created_at',
			'updated_at'
		],
		timestamps: ['archived_at', 'created_at', 'updated_at']
	},
	payments: {
		required: ['id', 'debt_id', 'amount', 'payment_date', 'payment_method'],
		columns: [
			'id',
			'debt_id',
			'amount',
			'payment_date',
			'payment_method',
			'notes',
			'created_at',
			'updated_at'
		],
		timestamps: ['created_at', 'updated_at']
	},
	payment_proofs: {
		required: ['id', 'payment_id', 'file_url'],
		columns: ['id', 'payment_id', 'file_url', 'file_name', 'file_type', 'file_size', 'created_at'],
		timestamps: ['created_at']
	}
};

const args = process.argv.slice(2);

if (args.length === 0) {
	console.error('Usage :');
	console.error('  node scripts/csv-to-tables.mjs <table>=<chemin.csv> [...]');
	console.error('  node scripts/csv-to-tables.mjs <dossier-contenant-les-csv>');
	console.error(`\nTables reconnues : ${Object.keys(TABLES).join(', ')}`);
	process.exit(1);
}

/** @type {Map<string, string>} */
const sources = new Map();

for (const arg of args) {
	const separator = arg.indexOf('=');

	if (separator > 0) {
		const table = arg.slice(0, separator).trim().toLowerCase();
		const path = arg.slice(separator + 1).trim();

		if (!(table in TABLES)) {
			console.error(`Table inconnue : ${table}. Attendu : ${Object.keys(TABLES).join(', ')}`);
			process.exit(1);
		}
		sources.set(table, resolve(path));
		continue;
	}

	// Argument sans « = » : un dossier où chercher <table>.csv
	const dir = resolve(arg);
	if (!existsSync(dir) || !statSync(dir).isDirectory()) {
		console.error(`Ni paire table=chemin, ni dossier existant : ${arg}`);
		process.exit(1);
	}

	for (const table of Object.keys(TABLES)) {
		const candidate = join(dir, `${table}.csv`);
		if (existsSync(candidate)) sources.set(table, candidate);
	}

	if (sources.size === 0) {
		console.error(`Aucun fichier <table>.csv trouvé dans ${dir}`);
		process.exit(1);
	}
}

mkdirSync(OUT_DIR, { recursive: true });

let totalRows = 0;
let problems = 0;

for (const [table, path] of sources) {
	const spec = TABLES[/** @type {keyof TABLES} */ (table)];

	if (!existsSync(path)) {
		console.error(`✗ ${table} : fichier introuvable — ${path}`);
		problems++;
		continue;
	}

	const parsed = parseCsv(readFileSync(path, 'utf8'));

	const missing = spec.required.filter((c) => !parsed.columns.includes(c));
	if (missing.length > 0) {
		console.error(
			`✗ ${table} : colonne(s) obligatoire(s) absente(s) — ${missing.join(', ')}\n` +
				`  colonnes lues : ${parsed.columns.join(', ')}`
		);
		problems++;
		continue;
	}

	const ignored = parsed.columns.filter((c) => !spec.columns.includes(c));

	const rows = [];
	let skipped = 0;

	for (const record of toRecords(parsed)) {
		// Une ligne sans ses champs obligatoires ne peut pas être insérée.
		const incomplete = spec.required.filter((c) => record[c] === null);
		if (incomplete.length > 0) {
			console.warn(`  ! ${table} : ligne ignorée, ${incomplete.join(', ')} vide`);
			skipped++;
			continue;
		}

		/** @type {Record<string, string | null>} */
		const row = {};
		for (const column of spec.columns) {
			const value = record[column] ?? null;
			row[column] = spec.timestamps.includes(column) ? timestamp(value) : value;
		}
		rows.push(row);
	}

	writeFileSync(join(OUT_DIR, `${table}.json`), JSON.stringify(rows, null, 2), 'utf8');
	totalRows += rows.length;

	console.log(`  ${table.padEnd(16)} ${String(rows.length).padStart(5)} ligne(s)`);
	if (skipped > 0) console.log(`  ${''.padEnd(16)} ${skipped} ignorée(s)`);
	if (ignored.length > 0) {
		console.log(`  ${''.padEnd(16)} colonnes non reprises : ${ignored.join(', ')}`);
	}
}

// import-turso.mjs exige les cinq fichiers : on signale ceux qui manquent.
const absent = Object.keys(TABLES).filter((t) => !existsSync(join(OUT_DIR, `${t}.json`)));

console.log(`\n${totalRows} ligne(s) écrite(s) dans ${OUT_DIR}`);

if (absent.length > 0) {
	console.log(`\n⚠ Tables encore absentes : ${absent.join(', ')}`);
	console.log('  import-turso.mjs les exige toutes. Pour une table réellement vide,');
	console.log(`  crée un fichier contenant [] : migration-data/<table>.json`);
}

if (problems > 0) process.exitCode = 1;
