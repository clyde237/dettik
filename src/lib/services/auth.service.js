import { supabase } from '$lib/supabase/client';

// ============================================
// AUTHENTIFICATION CLASSIQUE
// ============================================

/**
 * Inscription avec email et mot de passe
 * @param {{ email: string, password: string, full_name: string }} params
 */
export async function register({ email, password, full_name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Connexion avec email et mot de passe
 * @param {{ email: string, password: string }} params
 * @returns {Promise<{ session: any, user: any, mfaRequired: boolean, factorId?: string }>}
 */
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Vérifier si l'utilisateur a activé la 2FA
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const totpFactors = factorsData?.totp ?? [];

  if (totpFactors.length > 0) {
    // L'utilisateur a la 2FA activée → il faut vérifier
    return {
      session: data.session,
      user: data.user,
      mfaRequired: true,
      factorId: totpFactors[0].id
    };
  }

  return {
    session: data.session,
    user: data.user,
    mfaRequired: false
  };
}

/**
 * Déconnexion
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Envoyer un email de réinitialisation
 * @param {string} email
 */
export async function forgotPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) throw error;
}

/**
 * Réinitialiser le mot de passe
 * @param {string} password
 */
export async function resetPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

// ============================================
// OAUTH (Google, Facebook)
// ============================================

/**
 * Connexion avec un provider OAuth
 * @param {'google' | 'facebook'} provider
 */
export async function loginWithOAuth(provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`
    }
  });
  if (error) throw error;
}

// ============================================
// 2FA (TOTP)
// ============================================

/**
 * Créer un challenge MFA et le vérifier avec le code TOTP
 * @param {{ factorId: string, code: string }} params
 */
export async function verifyMFA({ factorId, code }) {
  // Créer le challenge
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });

  if (challengeError) throw challengeError;

  // Vérifier le code
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code
  });

  if (error) throw error;
  return data;
}

/**
 * Inscrire l'utilisateur à la 2FA (génère le QR code)
 * → Sera utilisé dans les paramètres (Module 10)
 */
export async function enrollMFA() {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Dettik Authenticator'
  });

  if (error) throw error;
  return data; // contient totp.qr_code et totp.uri
}

/**
 * Désactiver la 2FA
 * @param {string} factorId
 */
export async function unenrollMFA(factorId) {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
}

// ============================================
// PROFIL
// ============================================

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour le profil
 * @param {Record<string, any>} updates
 */
export async function updateProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}