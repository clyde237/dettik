import { dbGetAll, dbGet, dbPut, dbPutAll, dbDelete } from './index.js';

const STORE = 'payments';

export async function localGetPayments(debtId) {
  return dbGetAll(STORE, 'debt_id', debtId);
}

export async function localGetPayment(id) {
  return dbGet(STORE, id);
}

export async function localSavePayment(payment) {
  return dbPut(STORE, payment);
}

export async function localSavePayments(payments) {
  return dbPutAll(STORE, payments);
}

export async function localDeletePayment(id) {
  return dbDelete(STORE, id);
}