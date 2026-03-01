import { supabase } from '$lib/supabase/client';

/**
 * @typedef {import('$lib/services/debts.service').Debt} ArchivedItem
 */

/**
 * Récupérer toutes les entrées archivées (dettes + créances)
 * @returns {Promise<ArchivedItem[]>}
 */
export async function getArchives() {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('status', 'archived')
    .order('archived_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer une entrée archivée par son ID
 * @param {string} id
 * @returns {Promise<ArchivedItem>}
 */
export async function getArchivedItem(id) {
  const { data, error } = await supabase
    .from('debts')
    .select('*, person:persons(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Restaurer une entrée archivée
 * @param {string} id
 * @returns {Promise<ArchivedItem>}
 */
export async function restoreArchive(id) {
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
 * Supprimer définitivement une entrée archivée
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteArchive(id) {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}