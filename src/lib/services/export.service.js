import { formatAmount } from '$lib/utils/currency';
import { formatDate } from '$lib/utils/date';

/**
 * Exporter des données en CSV
 * @param {Array<import('$lib/services/debts.service').Debt>} items
 * @param {'all' | 'debt' | 'credit'} type
 */
export function exportToCSV(items, type = 'all') {
  const filtered = type === 'all'
    ? items
    : items.filter((item) => item.type === type);

  const headers = [
    'Type',
    'Personne',
    'Montant total',
    'Montant restant',
    'Devise',
    'Description',
    'Date',
    'Échéance',
    'Taux intérêt',
    'Statut',
    'Date archivage'
  ];

  const rows = filtered.map((item) => [
    item.type === 'debt' ? 'Dette' : 'Créance',
    item.person?.name || 'Inconnu',
    item.total_amount,
    item.remaining_amount,
    item.currency,
    item.description || '',
    formatDate(item.loan_date, 'short'),
    item.due_date ? formatDate(item.due_date, 'short') : '',
    item.interest_rate || '',
    item.status === 'active' ? 'En cours' : 'Archivé',
    item.archived_at ? formatDate(item.archived_at, 'short') : ''
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';'))
  ].join('\n');

  // BOM pour que Excel reconnaisse l'UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dettik_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}