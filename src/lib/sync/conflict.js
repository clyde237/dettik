/**
 * Résolution de conflits entre données locales et distantes
 * Stratégie : "Last Write Wins" basée sur updated_at
 */

/**
 * Résoudre un conflit entre une version locale et distante
 * @param {any} local - Version locale (avec updated_at)
 * @param {any} remote - Version distante (avec updated_at)
 * @returns {'local' | 'remote'} Quelle version conserver
 */
export function resolveConflict(local, remote) {
  if (!local?.updated_at) return 'remote';
  if (!remote?.updated_at) return 'local';

  const localTime = new Date(local.updated_at).getTime();
  const remoteTime = new Date(remote.updated_at).getTime();

  // La version la plus récente gagne
  return localTime >= remoteTime ? 'local' : 'remote';
}

/**
 * Fusionner une liste locale avec une liste distante
 * @param {any[]} localItems
 * @param {any[]} remoteItems
 * @returns {any[]}
 */
export function mergeList(localItems, remoteItems) {
  const merged = new Map();

  // Commencer par les items distants (base de vérité)
  for (const item of remoteItems) {
    merged.set(item.id, item);
  }

  // Les items locaux plus récents écrasent
  for (const local of localItems) {
    const remote = merged.get(local.id);
    if (remote) {
      const winner = resolveConflict(local, remote);
      if (winner === 'local') merged.set(local.id, local);
    } else {
      // Item local non trouvé en distant → créé hors ligne
      merged.set(local.id, { ...local, _pendingSync: true });
    }
  }

  return Array.from(merged.values());
}