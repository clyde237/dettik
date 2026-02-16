import { z } from 'zod';

// ============================================
// Règles de mot de passe robuste
// ============================================
const passwordRules = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial (!@#$%...)');

// ============================================
// Schéma : Connexion
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
});

// ============================================
// Schéma : Inscription
// ============================================
export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: passwordRules,
  confirm_password: z
    .string()
    .min(1, 'Confirmez le mot de passe'),
  terms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Vous devez accepter les conditions d\'utilisation'
    })
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password']
});

// ============================================
// Schéma : Mot de passe oublié
// ============================================
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
});

// ============================================
// Schéma : Réinitialisation mot de passe
// ============================================
export const resetPasswordSchema = z.object({
  password: passwordRules,
  confirm_password: z
    .string()
    .min(1, 'Confirmez le mot de passe')
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password']
});

// ============================================
// Helper : extraire les erreurs par champ
// ============================================
/**
 * @param {z.ZodError} zodError
 * @returns {Record<string, string>}
 */
export function extractErrors(zodError) {
  /** @type {Record<string, string>} */
  const errors = {};
  for (const issue of zodError.issues) {
    const field = issue.path[0]?.toString();
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}