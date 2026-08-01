/**
 * Authentification via Clerk.
 *
 * Les flux passent par les ressources signIn/signUp de Clerk JS plutôt que par
 * les composants préfabriqués, pour conserver les formulaires existants.
 *
 * L'instance Clerk n'est accessible que depuis le contexte du composant
 * (useClerkContext()), elle est donc passée en premier argument — un module
 * ordinaire ne peut pas lire un contexte Svelte.
 */

/** @typedef {import('@clerk/shared/types').LoadedClerk} Clerk */

/**
 * @param {any} clerk
 * @returns {Clerk}
 */
function requireClerk(clerk) {
	if (!clerk) throw new Error("Le service d'authentification n'est pas encore chargé");
	return clerk;
}

/**
 * Traduit une erreur Clerk en message affichable.
 * @param {unknown} err
 * @returns {string}
 */
export function authErrorMessage(err) {
	const clerkErrors = /** @type {any} */ (err)?.errors;
	if (Array.isArray(clerkErrors) && clerkErrors.length > 0) {
		return clerkErrors[0].longMessage || clerkErrors[0].message || 'Erreur inconnue';
	}
	return err instanceof Error ? err.message : 'Erreur inconnue';
}

// ============================================
// INSCRIPTION
// ============================================

/**
 * Démarre une inscription email + mot de passe.
 *
 * Selon la configuration de l'instance Clerk, un code de vérification peut être
 * exigé : dans ce cas needsVerification vaut true et il faut enchaîner sur
 * verifyEmailCode().
 *
 * @param {any} clerk
 * @param {{ email: string, password: string }} params
 * @returns {Promise<{ complete: boolean, needsVerification: boolean }>}
 */
export async function register(clerk, { email, password }) {
	const instance = requireClerk(clerk);

	const signUp = await instance.client.signUp.create({
		emailAddress: email,
		password
	});

	if (signUp.status === 'complete') {
		await instance.setActive({ session: signUp.createdSessionId });
		return { complete: true, needsVerification: false };
	}

	await instance.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
	return { complete: false, needsVerification: true };
}

/**
 * Valide le code reçu par email et active la session.
 * @param {any} clerk
 * @param {string} code
 * @returns {Promise<{ complete: boolean }>}
 */
export async function verifyEmailCode(clerk, code) {
	const instance = requireClerk(clerk);

	const signUp = await instance.client.signUp.attemptEmailAddressVerification({ code });

	if (signUp.status !== 'complete') return { complete: false };

	await instance.setActive({ session: signUp.createdSessionId });
	return { complete: true };
}

// ============================================
// CONNEXION
// ============================================

/**
 * Connexion email + mot de passe.
 * @param {any} clerk
 * @param {{ email: string, password: string }} params
 * @returns {Promise<{ complete: boolean, status: string | null }>}
 */
export async function login(clerk, { email, password }) {
	const instance = requireClerk(clerk);

	const signIn = await instance.client.signIn.create({
		identifier: email,
		password
	});

	if (signIn.status === 'complete') {
		await instance.setActive({ session: signIn.createdSessionId });
		return { complete: true, status: signIn.status };
	}

	return { complete: false, status: signIn.status };
}

/**
 * Déconnexion.
 * @param {any} clerk
 */
export async function logout(clerk) {
	await requireClerk(clerk).signOut();
}

// ============================================
// MOT DE PASSE OUBLIÉ
// ============================================

/**
 * Envoie un code de réinitialisation par email.
 *
 * La tentative reste vivante sur clerk.client.signIn, ce qui permet de terminer
 * la réinitialisation depuis la page /reset-password.
 *
 * @param {any} clerk
 * @param {string} email
 */
export async function forgotPassword(clerk, email) {
	await requireClerk(clerk).client.signIn.create({
		strategy: 'reset_password_email_code',
		identifier: email
	});
}

/**
 * Valide le code puis applique le nouveau mot de passe.
 * @param {any} clerk
 * @param {{ code: string, password: string }} params
 * @returns {Promise<{ complete: boolean, status: string | null }>}
 */
export async function resetPassword(clerk, { code, password }) {
	const instance = requireClerk(clerk);

	const attempt = await instance.client.signIn.attemptFirstFactor({
		strategy: 'reset_password_email_code',
		code
	});

	if (attempt.status !== 'needs_new_password' && attempt.status !== 'complete') {
		return { complete: false, status: attempt.status };
	}

	const signIn = await instance.client.signIn.resetPassword({ password });

	if (signIn.status === 'complete') {
		await instance.setActive({ session: signIn.createdSessionId });
		return { complete: true, status: signIn.status };
	}

	return { complete: false, status: signIn.status };
}

// ============================================
// PROFIL
// ============================================

/**
 * @typedef {Object} Profile
 * @property {string} id ID utilisateur Clerk
 * @property {string|null} email
 * @property {string|null} full_name
 * @property {string} preferred_currency
 * @property {string} preferred_language
 * @property {string} preferred_theme
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Récupère le profil applicatif (préférences + email).
 * @returns {Promise<Profile | null>}
 */
export async function getProfile() {
	const response = await fetch('/api/profile');
	if (!response.ok) throw new Error('Impossible de charger le profil');
	return response.json();
}

/**
 * Met à jour le profil applicatif.
 * @param {Partial<Profile>} updates
 * @returns {Promise<Profile>}
 */
export async function updateProfile(updates) {
	const response = await fetch('/api/profile', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updates)
	});

	if (!response.ok) throw new Error('Impossible de mettre à jour le profil');
	return response.json();
}
