import { query, queryOne, transaction, now } from '../turso.js';
import { newId } from '$lib/utils/id.js';

/**
 * Attache les preuves à une liste de versements.
 * Équivalent du select imbriqué PostgREST `*, proofs:payment_proofs(*)`.
 * @param {Record<string, any>[]} payments
 */
async function attachProofs(payments) {
	if (payments.length === 0) return payments;

	const placeholders = payments.map(() => '?').join(', ');
	const proofs = await query(
		`SELECT * FROM payment_proofs
      WHERE payment_id IN (${placeholders})
      ORDER BY created_at ASC`,
		payments.map((p) => p.id)
	);

	/** @type {Map<string, Record<string, any>[]>} */
	const byPayment = new Map();
	for (const proof of proofs) {
		const list = byPayment.get(String(proof.payment_id));
		if (list) list.push(proof);
		else byPayment.set(String(proof.payment_id), [proof]);
	}

	return payments.map((payment) => ({
		...payment,
		proofs: byPayment.get(String(payment.id)) ?? []
	}));
}

/**
 * Versements d'une dette, du plus récent au plus ancien.
 * @param {string} userId
 * @param {string} debtId
 */
export async function listPayments(userId, debtId) {
	const payments = await query(
		`SELECT pa.*
       FROM payments pa
       JOIN debts d ON d.id = pa.debt_id
      WHERE pa.debt_id = ? AND d.user_id = ?
      ORDER BY pa.payment_date DESC`,
		[debtId, userId]
	);

	return attachProofs(payments);
}

/**
 * @param {string} userId
 * @param {string} id
 */
export async function getPayment(userId, id) {
	const payment = await queryOne(
		`SELECT pa.*
       FROM payments pa
       JOIN debts d ON d.id = pa.debt_id
      WHERE pa.id = ? AND d.user_id = ?`,
		[id, userId]
	);

	if (!payment) return null;
	const [withProofs] = await attachProofs([payment]);
	return withProofs;
}

/**
 * Enregistre un versement et met à jour le restant dû de la dette.
 *
 * Ce calcul se faisait auparavant côté client en trois requêtes séparées, ce qui
 * laissait la porte ouverte aux écritures concurrentes. Tout est désormais dans
 * une transaction unique côté serveur.
 *
 * data.id permet de réutiliser l'identifiant généré côté client quand une
 * création faite hors ligne est rejouée depuis la file de synchronisation.
 *
 * @param {string} userId
 * @param {{
 *   id?: string,
 *   debt_id: string,
 *   amount: number,
 *   payment_date: string,
 *   payment_method: string,
 *   notes?: string|null
 * }} data
 * @returns {Promise<
 *   | { ok: true, paymentId: string, newRemaining: number }
 *   | { ok: false, reason: 'not_found' }
 *   | { ok: false, reason: 'amount_too_high', remaining: number }
 * >}
 */
export async function createPayment(userId, data) {
	const tx = await transaction();

	try {
		const debtResult = await tx.execute({
			sql: 'SELECT remaining_amount, total_amount FROM debts WHERE id = ? AND user_id = ?',
			args: [data.debt_id, userId]
		});

		const debt = debtResult.rows[0];
		if (!debt) {
			await tx.rollback();
			return { ok: false, reason: 'not_found' };
		}

		const currentRemaining = Number(debt.remaining_amount);
		if (data.amount > currentRemaining) {
			await tx.rollback();
			return { ok: false, reason: 'amount_too_high', remaining: currentRemaining };
		}

		const paymentId = data.id || newId();
		await tx.execute({
			sql: `INSERT INTO payments (id, debt_id, amount, payment_date, payment_method, notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
			args: [
				paymentId,
				data.debt_id,
				data.amount,
				data.payment_date,
				data.payment_method,
				data.notes ?? null
			]
		});

		// Dette soldée : on l'archive, comme le faisait createPayment côté client.
		const newRemaining = Math.max(0, currentRemaining - data.amount);
		if (newRemaining <= 0) {
			await tx.execute({
				sql: `UPDATE debts SET remaining_amount = ?, status = 'archived', archived_at = ?
               WHERE id = ? AND user_id = ?`,
				args: [newRemaining, now(), data.debt_id, userId]
			});
		} else {
			await tx.execute({
				sql: 'UPDATE debts SET remaining_amount = ? WHERE id = ? AND user_id = ?',
				args: [newRemaining, data.debt_id, userId]
			});
		}

		await tx.commit();
		return { ok: true, paymentId, newRemaining };
	} finally {
		tx.close();
	}
}

/**
 * Supprime un versement, ses preuves, et recrédite le restant dû.
 *
 * @param {string} userId
 * @param {string} paymentId
 * @returns {Promise<
 *   | { ok: true, newRemaining: number, proofUrls: string[] }
 *   | { ok: false, reason: 'not_found' }
 * >}
 */
export async function deletePayment(userId, paymentId) {
	const tx = await transaction();

	try {
		const paymentResult = await tx.execute({
			sql: `SELECT pa.amount, pa.debt_id, d.total_amount, d.remaining_amount
              FROM payments pa
              JOIN debts d ON d.id = pa.debt_id
             WHERE pa.id = ? AND d.user_id = ?`,
			args: [paymentId, userId]
		});

		const payment = paymentResult.rows[0];
		if (!payment) {
			await tx.rollback();
			return { ok: false, reason: 'not_found' };
		}

		const proofsResult = await tx.execute({
			sql: 'SELECT file_url FROM payment_proofs WHERE payment_id = ?',
			args: [paymentId]
		});
		const proofUrls = proofsResult.rows.map((row) => String(row.file_url));

		await tx.execute({
			sql: 'DELETE FROM payment_proofs WHERE payment_id = ?',
			args: [paymentId]
		});
		await tx.execute({
			sql: 'DELETE FROM payments WHERE id = ?',
			args: [paymentId]
		});

		const newRemaining = Math.min(
			Number(payment.total_amount),
			Number(payment.remaining_amount) + Number(payment.amount)
		);

		await tx.execute({
			sql: `UPDATE debts SET remaining_amount = ?, status = 'active', archived_at = NULL
             WHERE id = ? AND user_id = ?`,
			args: [newRemaining, payment.debt_id, userId]
		});

		await tx.commit();
		return { ok: true, newRemaining, proofUrls };
	} finally {
		tx.close();
	}
}
