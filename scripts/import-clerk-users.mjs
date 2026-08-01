/**
 * Crée dans Clerk les utilisateurs exportés de Supabase.
 *
 *   node --env-file=.env scripts/import-clerk-users.mjs
 *
 * Les empreintes bcrypt d'auth.users sont transmises telles quelles
 * (password_hasher = bcrypt) : les utilisateurs gardent leur mot de passe
 * actuel, aucune réinitialisation n'est nécessaire.
 *
 * L'ancien UUID Supabase est stocké dans externalId, comme le recommande la doc
 * de migration Clerk. C'est lui qui rend le script rejouable — un utilisateur
 * déjà importé est retrouvé et non recréé — et qui alimente la table de
 * correspondance UUID → ID Clerk utilisée ensuite par import-turso.mjs.
 *
 * Comptes sans empreinte de mot de passe (inscriptions OAuth ou lien magique,
 * encrypted_password à NULL chez Supabase) : ils ne peuvent pas emporter de mot
 * de passe. Deux traitements, via PASSWORDLESS_STRATEGY :
 *
 *   temporary (défaut) — un mot de passe aléatoire, que personne ne connaît, est
 *     posé sur le compte. La stratégie « mot de passe » est donc disponible et
 *     l'utilisateur récupère son accès par « mot de passe oublié ». Fonctionne
 *     sur une instance Clerk configurée en email + mot de passe seulement.
 *
 *   skip — le compte est créé sans mot de passe. Clerk refuse ce cas si le mot
 *     de passe est l'unique moyen de connexion de l'instance : à réserver aux
 *     instances où une autre stratégie (code par email, OAuth) est activée.
 *
 * Les comptes concernés sont listés dans migration-data/users-without-password.txt
 * pour pouvoir les prévenir.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClerkClient } from '@clerk/backend';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migration-data');

const { CLERK_SECRET_KEY } = process.env;

if (!CLERK_SECRET_KEY) {
	console.error('CLERK_SECRET_KEY est absent de .env.');
	process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

/** Clerk limite la création d'utilisateurs : on espace les appels. */
const DELAY_MS = 600;

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PASSWORDLESS_STRATEGY = process.env.PASSWORDLESS_STRATEGY === 'skip' ? 'skip' : 'temporary';

/** Mot de passe jetable, jamais communiqué : le compte passe par « mot de passe oublié ». */
function temporaryPassword() {
	return `Dettik-${crypto.randomUUID()}-${Date.now()}!`;
}

/** @type {any[]} */
const users = JSON.parse(readFileSync(join(DATA_DIR, 'users.json'), 'utf8'));

// profiles.json ne vient que de l'export Postgres complet : absent quand les
// utilisateurs ont été convertis depuis un CSV, et ce n'est pas bloquant.
const profilesPath = join(DATA_DIR, 'profiles.json');
/** @type {any[]} */
const profiles = existsSync(profilesPath) ? JSON.parse(readFileSync(profilesPath, 'utf8')) : [];

const fullNameById = new Map(profiles.map((p) => [p.id, p.full_name]));

/** @type {Record<string, string>} */
const map = {};
/** @type {string[]} */
const withoutPassword = [];
let created = 0;
let reused = 0;
let failed = 0;

console.log(`${users.length} utilisateur(s) à importer.\n`);

for (const user of users) {
	const label = user.email ?? user.id;

	try {
		// Déjà importé lors d'un passage précédent ?
		const existing = await clerk.users.getUserList({ externalId: [user.id], limit: 1 });
		if (existing.data.length > 0) {
			map[user.id] = existing.data[0].id;
			reused++;
			console.log(`= ${label} → ${existing.data[0].id} (déjà présent)`);
			continue;
		}

		if (!user.email) {
			console.warn(`! ${user.id} ignoré : aucune adresse email`);
			failed++;
			continue;
		}

		const fullName = fullNameById.get(user.id) || user.raw_user_meta_data?.full_name || '';
		const [firstName, ...rest] = String(fullName).trim().split(/\s+/);

		/** @type {Record<string, any>} */
		const params = {
			externalId: user.id,
			emailAddress: [user.email],
			skipPasswordChecks: true,
			skipLegalChecks: true,
			createdAt: user.created_at ? new Date(user.created_at) : undefined
		};

		if (firstName) params.firstName = firstName;
		if (rest.length > 0) params.lastName = rest.join(' ');

		if (user.encrypted_password) {
			// L'empreinte bcrypt de Supabase est reprise telle quelle : le mot de
			// passe actuel de l'utilisateur continue de fonctionner.
			params.passwordDigest = user.encrypted_password;
			params.passwordHasher = 'bcrypt';
		} else {
			withoutPassword.push(user.email);

			if (PASSWORDLESS_STRATEGY === 'skip') {
				params.skipPasswordRequirement = true;
			} else {
				params.password = temporaryPassword();
			}
		}

		const clerkUser = await clerk.users.createUser(params);
		map[user.id] = clerkUser.id;
		created++;
		console.log(
			`+ ${label} → ${clerkUser.id}${user.encrypted_password ? '' : ' (sans mot de passe d’origine)'}`
		);
	} catch (err) {
		failed++;
		const message = err?.errors?.[0]?.longMessage || err?.message || String(err);
		console.error(`✗ ${label} : ${message}`);
	}

	await sleep(DELAY_MS);
}

writeFileSync(join(DATA_DIR, 'user-map.json'), JSON.stringify(map, null, 2), 'utf8');

console.log(`\nCréés : ${created} | Réutilisés : ${reused} | Échecs : ${failed}`);
console.log(`Correspondance écrite dans ${join(DATA_DIR, 'user-map.json')}`);

if (withoutPassword.length > 0) {
	const listPath = join(DATA_DIR, 'users-without-password.txt');
	writeFileSync(listPath, withoutPassword.join('\n') + '\n', 'utf8');

	console.log(
		`\n⚠ ${withoutPassword.length} compte(s) sans mot de passe d'origine ` +
			`(stratégie « ${PASSWORDLESS_STRATEGY} ») :`
	);
	for (const email of withoutPassword) console.log(`    ${email}`);
	console.log(`  Liste écrite dans ${listPath}`);
	console.log(
		PASSWORDLESS_STRATEGY === 'temporary'
			? '  Ces personnes doivent passer par « mot de passe oublié » à leur prochaine connexion.'
			: '  Ces comptes n’ont aucun mot de passe : une autre stratégie de connexion doit être activée dans Clerk.'
	);
}

if (failed > 0) process.exitCode = 1;
