/** Devises supportées */
export const CURRENCIES = [
  { code: 'XAF', label: 'Franc CFA (FCFA)', symbol: 'FCFA', locale: 'fr-FR' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€', locale: 'fr-FR' },
  { code: 'USD', label: 'Dollar ($)', symbol: '$', locale: 'en-US' },
  { code: 'GBP', label: 'Livre (£)', symbol: '£', locale: 'en-GB' }
];

/** Méthodes de paiement */
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'mtn_money', label: 'MTN Money' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'check', label: 'Chèque' },
  { value: 'other', label: 'Autre' }
];

/** Statuts possibles */
export const STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

/** Types */
export const TYPES = {
  DEBT: 'debt',
  CREDIT: 'credit'
};

/** Taille max des fichiers (5 MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Types de fichiers acceptés pour les preuves */
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];