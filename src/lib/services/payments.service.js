import { supabase } from '$lib/supabase/client';

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} debt_id
 * @property {number} amount
 * @property {string} payment_date
 * @property {string} payment_method
 * @property {string|null} notes
 * @property {string} created_at
 * @property {string} updated_at
 * @property {import('./proofs.service').Proof[]} [proofs]
 */

/**
 * Récupérer tous les versements d'une dette/créance
 * @param {string} debtId
 * @returns {Promise<Payment[]>}
 */
export async function getPayments(debtId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, proofs:payment_proofs(*)')
    .eq('debt_id', debtId)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer un versement par son ID
 * @param {string} id
 * @returns {Promise<Payment>}
 */
export async function getPayment(id) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, proofs:payment_proofs(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Créer un versement et mettre à jour le remaining_amount
 * @param {{
 *   debt_id: string,
 *   amount: number,
 *   payment_date: string,
 *   payment_method: string,
 *   notes?: string
 * }} params
 * @returns {Promise<{ payment: Payment, newRemaining: number }>}
 */
export async function createPayment({ debt_id, amount, payment_date, payment_method, notes }) {
  // 1. Récupérer la dette pour connaître le remaining
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('remaining_amount, total_amount')
    .eq('id', debt_id)
    .single();

  if (debtError) throw debtError;

  const currentRemaining = Number(debt.remaining_amount);

  // Vérifier que le montant ne dépasse pas le restant
  if (amount > currentRemaining) {
    throw new Error(`Le montant ne peut pas dépasser ${currentRemaining}`);
  }

  // 2. Créer le versement
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      debt_id,
      amount,
      payment_date,
      payment_method,
      notes: notes?.trim() || null
    })
    .select('*, proofs:payment_proofs(*)')
    .single();

  if (paymentError) throw paymentError;

  // 3. Mettre à jour le remaining_amount
  const newRemaining = Math.max(0, currentRemaining - amount);
  const updateData = {
    remaining_amount: newRemaining,
    ...(newRemaining <= 0 ? {
      status: 'archived',
      archived_at: new Date().toISOString()
    } : {})
  };

  const { error: updateError } = await supabase
    .from('debts')
    .update(updateData)
    .eq('id', debt_id);

  if (updateError) throw updateError;

  return { payment, newRemaining };
}

/**
 * Supprimer un versement et recalculer le remaining
 * @param {string} paymentId
 * @param {string} debtId
 * @returns {Promise<{ newRemaining: number }>}
 */
export async function deletePayment(paymentId, debtId) {
  // 1. Récupérer le montant du versement
  const { data: payment, error: getError } = await supabase
    .from('payments')
    .select('amount')
    .eq('id', paymentId)
    .single();

  if (getError) throw getError;

  // 2. Supprimer le versement
  const { error: deleteError } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId);

  if (deleteError) throw deleteError;

  // 3. Recalculer le remaining
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('remaining_amount, total_amount')
    .eq('id', debtId)
    .single();

  if (debtError) throw debtError;

  const newRemaining = Math.min(
    Number(debt.total_amount),
    Number(debt.remaining_amount) + Number(payment.amount)
  );

  const { error: updateError } = await supabase
    .from('debts')
    .update({
      remaining_amount: newRemaining,
      status: 'active',
      archived_at: null
    })
    .eq('id', debtId);

  if (updateError) throw updateError;

  return { newRemaining };
}