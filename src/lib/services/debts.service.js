import { supabase } from '$lib/supabase/client';

/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} user_id
 * @property {string} person_id
 * @property {'debt' | 'credit'} type
 * @property {number} total_amount
 * @property {number} remaining_amount
 * @property {string} currency
 * @property {string|null} description
 * @property {string} loan_date
 * @property {string|null} due_date
 * @property {number|null} interest_rate
 * @property {'active' | 'archived'} status
 * @property {string|null} archived_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {import('$lib/stores/persons').Person} [person]
 */

/**
 * Récupérer toutes les dettes (type = 'debt') actives
 * @returns {Promise<Debt[]>}
 */
export async function getDebts() {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('type', 'debt')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer une dette par son ID avec la personne liée
 * @param {string} id
 * @returns {Promise<Debt>}
 */
export async function getDebt(id) {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Créer une nouvelle dette
 * @param {{
 *   person_id: string,
 *   type: 'debt' | 'credit',
 *   total_amount: number,
 *   currency?: string,
 *   description?: string,
 *   loan_date: string,
 *   due_date?: string,
 *   interest_rate?: number
 * }} params
 * @returns {Promise<Debt>}
 */
export async function createDebt({
  person_id,
  type,
  total_amount,
  currency = 'XAF',
  description,
  loan_date,
  due_date,
  interest_rate
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  const debtData = {
    user_id: user.id,
    person_id,
    type,
    total_amount,
    remaining_amount: total_amount,
    currency,
    description: description?.trim() || null,
    loan_date,
    due_date: due_date || null,
    interest_rate: interest_rate || null,
    status: 'active'
  };

  const { data, error } = await supabase
    .from('debts')
    .insert(debtData)
    .select('*, person:persons(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une dette
 * @param {string} id
 * @param {{
 *   person_id?: string,
 *   total_amount?: number,
 *   currency?: string,
 *   description?: string,
 *   loan_date?: string,
 *   due_date?: string,
 *   interest_rate?: number
 * }} updates
 * @returns {Promise<Debt>}
 */
export async function updateDebt(id, updates) {
  /** @type {Record<string, any>} */
  const cleanUpdates = {};

  if (updates.person_id !== undefined) cleanUpdates.person_id = updates.person_id;
  if (updates.total_amount !== undefined) {
    cleanUpdates.total_amount = updates.total_amount;

    // Recalculer le remaining_amount si le total change
    const current = await getDebt(id);
    const paid = current.total_amount - current.remaining_amount;
    cleanUpdates.remaining_amount = Math.max(0, updates.total_amount - paid);
  }
  if (updates.currency !== undefined) cleanUpdates.currency = updates.currency;
  if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || null;
  if (updates.loan_date !== undefined) cleanUpdates.loan_date = updates.loan_date;
  if (updates.due_date !== undefined) cleanUpdates.due_date = updates.due_date || null;
  if (updates.interest_rate !== undefined) cleanUpdates.interest_rate = updates.interest_rate || null;

  const { data, error } = await supabase
    .from('debts')
    .update(cleanUpdates)
    .eq('id', id)
    .select('*, person:persons(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprimer une dette
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDebt(id) {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Archiver une dette manuellement
 * @param {string} id
 * @returns {Promise<Debt>}
 */
export async function archiveDebt(id) {
  const { data, error } = await supabase
    .from('debts')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*, person:persons(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Restaurer une dette archivée
 * @param {string} id
 * @returns {Promise<Debt>}
 */
export async function restoreDebt(id) {
  const { data, error } = await supabase
    .from('debts')
    .update({
      status: 'active',
      archived_at: null
    })
    .eq('id', id)
    .select('*, person:persons(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupérer les dettes archivées
 * @returns {Promise<Debt[]>}
 */
export async function getArchivedDebts() {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('type', 'debt')
    .eq('status', 'archived')
    .order('archived_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer les statistiques des dettes
 * @returns {Promise<{ total: number, totalRemaining: number, count: number }>}
 */
export async function getDebtsStats() {
  const { data, error } = await supabase
    .from('debts')
    .select('total_amount, remaining_amount')
    .eq('type', 'debt')
    .eq('status', 'active');

  if (error) throw error;

  const stats = (data || []).reduce(
    (acc, debt) => ({
      total: acc.total + Number(debt.total_amount),
      totalRemaining: acc.totalRemaining + Number(debt.remaining_amount),
      count: acc.count + 1
    }),
    { total: 0, totalRemaining: 0, count: 0 }
  );

  return stats;
}