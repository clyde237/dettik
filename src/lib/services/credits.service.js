import { supabase } from '$lib/supabase/client';

/**
 * @typedef {import('$lib/services/debts.service').Debt} Credit
 */

/**
 * Récupérer toutes les créances actives
 * @returns {Promise<Credit[]>}
 */
export async function getCredits() {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('type', 'credit')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer une créance par son ID
 * @param {string} id
 * @returns {Promise<Credit>}
 */
export async function getCredit(id) {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Créer une nouvelle créance
 * @param {{
 *   person_id: string,
 *   total_amount: number,
 *   currency?: string,
 *   description?: string,
 *   loan_date: string,
 *   due_date?: string,
 *   interest_rate?: number
 * }} params
 * @returns {Promise<Credit>}
 */
export async function createCredit({
  person_id,
  total_amount,
  currency = 'XAF',
  description,
  loan_date,
  due_date,
  interest_rate
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  const creditData = {
    user_id: user.id,
    person_id,
    type: 'credit',
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
    .insert(creditData)
    .select('*, person:persons(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une créance
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
 * @returns {Promise<Credit>}
 */
export async function updateCredit(id, updates) {
  /** @type {Record<string, any>} */
  const cleanUpdates = {};

  if (updates.person_id !== undefined) cleanUpdates.person_id = updates.person_id;
  if (updates.total_amount !== undefined) {
    cleanUpdates.total_amount = updates.total_amount;

    const current = await getCredit(id);
    const received = Number(current.total_amount) - Number(current.remaining_amount);
    cleanUpdates.remaining_amount = Math.max(0, updates.total_amount - received);
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
 * Supprimer une créance
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteCredit(id) {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Archiver une créance
 * @param {string} id
 * @returns {Promise<Credit>}
 */
export async function archiveCredit(id) {
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
 * Restaurer une créance archivée
 * @param {string} id
 * @returns {Promise<Credit>}
 */
export async function restoreCredit(id) {
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
 * Récupérer les créances archivées
 * @returns {Promise<Credit[]>}
 */
export async function getArchivedCredits() {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('type', 'credit')
    .eq('status', 'archived')
    .order('archived_at', { ascending: false });

  if (error) throw error;
  return data || [];
}