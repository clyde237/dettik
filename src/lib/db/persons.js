import { dbGetAll, dbGet, dbPut, dbPutAll, dbDelete } from './index.js';

const STORE = 'persons';

export async function localGetPersons(userId) {
  return dbGetAll(STORE, 'user_id', userId);
}

export async function localGetPerson(id) {
  return dbGet(STORE, id);
}

export async function localSavePerson(person) {
  return dbPut(STORE, person);
}

export async function localSavePersons(persons) {
  return dbPutAll(STORE, persons);
}

export async function localDeletePerson(id) {
  return dbDelete(STORE, id);
}