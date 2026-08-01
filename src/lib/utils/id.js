/**
 * Génère un identifiant pour une nouvelle ligne.
 *
 * Postgres s'en chargeait avec gen_random_uuid(). SQLite n'a pas d'équivalent
 * natif, les IDs sont donc générés côté application — même format UUID v4,
 * pour rester compatible avec les données existantes.
 *
 * @returns {string}
 */
export function newId() {
  return crypto.randomUUID();
}
