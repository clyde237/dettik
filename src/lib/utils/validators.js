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

// ============================================
// Schéma : Personne
// ============================================
export const personSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  phone: z
    .string()
    .max(20, 'Numéro trop long')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Format d\'email invalide')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional()
    .or(z.literal(''))
});

// ============================================
// Schéma : Dette / Créance
// ============================================
export const debtSchema = z.object({
  type: z
    .enum(['debt', 'credit'], {
      required_error: 'Le type est requis',
      invalid_type_error: 'Type invalide'
    }),
  total_amount: z
    .number({
      required_error: 'Le montant est requis',
      invalid_type_error: 'Le montant doit être un nombre'
    })
    .positive('Le montant doit être supérieur à 0'),
  currency: z
    .string()
    .default('XAF'),
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  loan_date: z
    .string()
    .min(1, 'La date est requise'),
  due_date: z
    .string()
    .optional()
    .or(z.literal('')),
  interest_rate: z
    .number()
    .min(0, 'Le taux ne peut pas être négatif')
    .max(100, 'Le taux ne peut pas dépasser 100%')
    .optional()
    .or(z.literal(0))
    .or(z.nan().transform(() => undefined))
});