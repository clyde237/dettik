/**
 * Calculer le solde net (créances - dettes)
 * @param {number} totalDebts - Total restant des dettes
 * @param {number} totalCredits - Total restant des créances
 * @returns {{ amount: number, status: 'positive' | 'negative' | 'neutral' }}
 */
export function calculateNetBalance(totalDebts, totalCredits) {
  const amount = totalCredits - totalDebts;
  return {
    amount,
    status: amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral'
  };
}

/**
 * Calculer le pourcentage de progression
 * @param {number} paid
 * @param {number} total
 * @returns {number}
 */
export function calculateProgress(paid, total) {
  if (total <= 0) return 0;
  return Math.min(Math.round((paid / total) * 100), 100);
}

/**
 * Trier par échéance la plus proche
 * @param {Array<{ due_date?: string | null }>} items
 * @returns {Array<{ due_date?: string | null }>}
 */
export function sortByDueDate(items) {
  return [...items]
    .filter((item) => item.due_date)
    .sort((a, b) => {
      const dateA = new Date(a.due_date || '').getTime();
      const dateB = new Date(b.due_date || '').getTime();
      return dateA - dateB;
    });
}

/**
 * Filtrer les éléments avec échéance proche (dans les X jours)
 * @param {Array<{ due_date?: string | null, remaining_amount: number }>} items
 * @param {number} [daysThreshold=7]
 * @returns {Array<{ due_date?: string | null, remaining_amount: number }>}
 */
export function getUpcomingDeadlines(items, daysThreshold = 7) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return items
    .filter((item) => {
      if (!item.due_date || Number(item.remaining_amount) <= 0) return false;
      const dueDate = new Date(item.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= daysThreshold;
    })
    .sort((a, b) => {
      return new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime();
    });
}