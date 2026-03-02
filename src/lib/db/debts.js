import { dbGetAll, dbGet, dbPut, dbPutAll, dbDelete } from './index.js';

const STORE = 'debts';

/** @returns {Promise<import('$lib/services/debts.service').Debt[]>} */
export async function localGetDebts(userId) {
  const all = await dbGetAll(STORE, 'user_id', userId);
  return all.filter((d) => d.type === 'debt' && d.status === 'active');
}

/** @returns {Promise<import('$lib/services/debts.service').Debt[]>} */
export async function localGetCredits(userId) {
  const all = await dbGetAll(STORE, 'user_id', userId);
  return all.filter((d) => d.type === 'credit' && d.status === 'active');
}

/** @returns {Promise<import('$lib/services/debts.service').Debt[]>} */
export async function localGetArchives(userId) {
  const all = await dbGetAll(STORE, 'user_id', userId);
  return all.filter((d) => d.status === 'archived');
}

/** @param {string} id */
export async function localGetDebt(id) {
  return dbGet(STORE, id);
}

/** @param {import('$lib/services/debts.service').Debt} debt */
export async function localSaveDebt(debt) {
  return dbPut(STORE, debt);
}

/** @param {import('$lib/services/debts.service').Debt[]} debts */
export async function localSaveDebts(debts) {
  return dbPutAll(STORE, debts);
}

/** @param {string} id */
export async function localDeleteDebt(id) {
  return dbDelete(STORE, id);
}