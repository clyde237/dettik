const DB_NAME = 'dettik_db';
const DB_VERSION = 1;

/** @type {IDBDatabase | null} */
let db = null;

export async function openDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => { db = request.result; resolve(db); };

    request.onupgradeneeded = (event) => {
      const database = /** @type {IDBOpenDBRequest} */ (event.target).result;

      if (!database.objectStoreNames.contains('debts')) {
        const s = database.createObjectStore('debts', { keyPath: 'id' });
        s.createIndex('user_id', 'user_id');
        s.createIndex('type', 'type');
        s.createIndex('status', 'status');
      }
      if (!database.objectStoreNames.contains('persons')) {
        const s = database.createObjectStore('persons', { keyPath: 'id' });
        s.createIndex('user_id', 'user_id');
      }
      if (!database.objectStoreNames.contains('payments')) {
        const s = database.createObjectStore('payments', { keyPath: 'id' });
        s.createIndex('debt_id', 'debt_id');
      }
      if (!database.objectStoreNames.contains('sync_queue')) {
        const s = database.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        s.createIndex('status', 'status');
        s.createIndex('created_at', 'created_at');
      }
    };
  });
}

export function closeDB() { if (db) { db.close(); db = null; } }

/** @param {string} storeName @param {'readonly'|'readwrite'} mode @param {(s: IDBObjectStore) => IDBRequest} op */
export async function dbTransaction(storeName, mode, op) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = op(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

/** @param {string} storeName @param {string} [indexName] @param {any} [indexValue] */
export async function dbGetAll(storeName, indexName, indexValue) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = (indexName && indexValue !== undefined)
      ? store.index(indexName).getAll(indexValue)
      : store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut(storeName, data) {
  return dbTransaction(storeName, 'readwrite', (s) => s.put(data));
}

export async function dbPutAll(storeName, items) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const item of items) store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbGet(storeName, id) {
  return dbTransaction(storeName, 'readonly', (s) => s.get(id));
}

export async function dbDelete(storeName, id) {
  return dbTransaction(storeName, 'readwrite', (s) => s.delete(id));
}

export async function dbClear(storeName) {
  return dbTransaction(storeName, 'readwrite', (s) => s.clear());
}