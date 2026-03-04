import { writable, get } from 'svelte/store';
import { getPayments, createPayment, deletePayment } from '$lib/services/payments.service';
import { uploadProof, deleteProof } from '$lib/services/proofs.service';
import { toastSuccess, toastError, toastWarning } from '$lib/stores/notifications';
import { updateDebtRemaining } from '$lib/stores/debts';
import { updateCreditRemaining } from '$lib/stores/credits';
import { localGetPayments, localSavePayments } from '$lib/db/payments.js';
import { isOnline } from '$lib/sync/online.js';

/**
 * @typedef {import('$lib/services/payments.service').Payment} Payment
 */

/**
 * @typedef {Object} PaymentsState
 * @property {Payment[]} list
 * @property {boolean} loading
 * @property {string} currentDebtId
 */

/** @type {import('svelte/store').Writable<PaymentsState>} */
export const payments = writable({
  list: [],
  loading: false,
  currentDebtId: ''
});

/**
 * Charger les versements d'une dette/créance — offline niveau 2
 * @param {string} debtId
 */
export async function loadPayments(debtId) {
  payments.update((state) => ({ ...state, loading: true, currentDebtId: debtId }));

  try {
    if (get(isOnline)) {
      // En ligne : Supabase + mise en cache local
      const data = await getPayments(debtId);
      await localSavePayments(data);
      payments.update((state) => ({ ...state, list: data, loading: false }));
    } else {
      // Hors ligne : IndexedDB
      const cached = await localGetPayments(debtId);
      payments.update((state) => ({ ...state, list: cached, loading: false }));
      if (cached.length > 0) {
        toastWarning('Historique en mode hors ligne');
      }
    }
  } catch (err) {
    // Fallback cache en cas d'erreur réseau
    try {
      const cached = await localGetPayments(debtId);
      payments.update((state) => ({ ...state, list: cached, loading: false }));
    } catch {
      payments.update((state) => ({ ...state, loading: false }));
      toastError('Erreur lors du chargement des versements');
    }
    console.error(err);
  }
}

/**
 * Ajouter un versement
 * @param {{
 *   debt_id: string,
 *   amount: number,
 *   payment_date: string,
 *   payment_method: string,
 *   notes?: string,
 *   type: 'debt' | 'credit'
 * }} data
 * @param {File[]} [files]
 * @returns {Promise<Payment|null>}
 */
export async function addPayment(data, files = []) {
  try {
    const { payment, newRemaining } = await createPayment({
      debt_id: data.debt_id,
      amount: data.amount,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      notes: data.notes
    });

    // Uploader les preuves
    if (files.length > 0) {
      const proofs = [];
      for (const file of files) {
        try {
          const proof = await uploadProof(payment.id, file);
          proofs.push(proof);
        } catch (err) {
          console.error('Erreur upload preuve:', err);
          toastError(`Erreur upload: ${file.name}`);
        }
      }
      payment.proofs = proofs;
    }

    // Mettre en cache local
    await localSavePayments([payment]);

    payments.update((state) => ({ ...state, list: [payment, ...state.list] }));

    if (data.type === 'debt') {
      updateDebtRemaining(data.debt_id, newRemaining);
    } else {
      updateCreditRemaining(data.debt_id, newRemaining);
    }

    if (newRemaining <= 0) {
      toastSuccess(data.type === 'debt'
        ? 'Dette entièrement remboursée ! Archivée automatiquement.'
        : 'Créance entièrement remboursée ! Archivée automatiquement.'
      );
    } else {
      toastSuccess('Versement ajouté');
    }

    return payment;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'ajout du versement";
    toastError(message);
    console.error(err);
    return null;
  }
}

/**
 * Supprimer un versement
 * @param {string} paymentId
 * @param {string} debtId
 * @param {'debt' | 'credit'} type
 * @returns {Promise<boolean>}
 */
export async function removePayment(paymentId, debtId, type) {
  try {
    const { newRemaining } = await deletePayment(paymentId, debtId);

    payments.update((state) => ({
      ...state,
      list: state.list.filter((p) => p.id !== paymentId)
    }));

    if (type === 'debt') {
      updateDebtRemaining(debtId, newRemaining);
    } else {
      updateCreditRemaining(debtId, newRemaining);
    }

    toastSuccess('Versement supprimé');
    return true;
  } catch (err) {
    toastError('Erreur lors de la suppression');
    console.error(err);
    return false;
  }
}

/**
 * Supprimer une preuve
 * @param {import('$lib/services/proofs.service').Proof} proof
 * @returns {Promise<boolean>}
 */
export async function removeProof(proof) {
  try {
    await deleteProof(proof);

    payments.update((state) => ({
      ...state,
      list: state.list.map((p) => {
        if (p.id === proof.payment_id && p.proofs) {
          return { ...p, proofs: p.proofs.filter((pr) => pr.id !== proof.id) };
        }
        return p;
      })
    }));

    toastSuccess('Preuve supprimée');
    return true;
  } catch (err) {
    toastError('Erreur lors de la suppression de la preuve');
    console.error(err);
    return false;
  }
}