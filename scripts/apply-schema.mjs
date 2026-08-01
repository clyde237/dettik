/**
 * Applique le schéma SQLite à la base Turso.
 *
 *   node --env-file=.env scripts/apply-schema.mjs
 *
 * Rejouable : toutes les instructions sont en CREATE ... IF NOT EXISTS.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client/web';

const MIGRATIONS_DIR = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'src',
	'lib',
	'server',
	'migrations'
);

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL) {
	console.error('TURSO_DATABASE_URL est absent. Renseigne .env puis relance.');
	process.exit(1);
}

const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

const files = readdirSync(MIGRATIONS_DIR)
	.filter((f) => f.endsWith('.sql'))
	.sort();

for (const file of files) {
	const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
	process.stdout.write(`→ ${file} ... `);

	// executeMultiple laisse le serveur découper les instructions avec le parseur
	// SQLite, ce qui préserve les corps de triggers (BEGIN ... END;).
	await turso.executeMultiple(sql);
	console.log('ok');
}

const tables = await turso.execute(
	"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
);

console.log(`\nTables en place : ${tables.rows.map((r) => r.name).join(', ')}`);
