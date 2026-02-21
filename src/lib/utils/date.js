/**
 * Formater une date en français
 * @param {string | Date} date
 * @param {'short' | 'medium' | 'long'} [format='medium']
 * @returns {string}
 */
export function formatDate(date, format = 'medium') {
  const d = new Date(date);

  /** @type {Record<string, Intl.DateTimeFormatOptions>} */
  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'long', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  };

  return d.toLocaleDateString('fr-FR', options[format]);
}

/**
 * Date relative (il y a 2 jours, dans 3 jours, etc.)
 * @param {string | Date} date
 * @returns {string}
 */
export function formatRelative(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays === -1) return 'Hier';
  if (diffDays > 1 && diffDays <= 30) return `Dans ${diffDays} jours`;
  if (diffDays < -1 && diffDays >= -30) return `Il y a ${Math.abs(diffDays)} jours`;

  return formatDate(date, 'short');
}

/**
 * Calculer le nombre de jours restants avant une date
 * @param {string | Date} date
 * @returns {number}
 */
export function daysUntil(date) {
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Obtenir la date du jour au format YYYY-MM-DD
 * @returns {string}
 */
export function today() {
  return new Date().toISOString().split('T')[0];
}