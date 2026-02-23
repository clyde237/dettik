import { supabase } from '$lib/supabase/client';

/**
 * Récupérer toutes les personnes de l'utilisateur connecté
 * @returns {Promise<import('$lib/stores/persons').Person[]>}
 */
export async function getPersons() {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer une personne par son ID
 * @param {string} id
 * @returns {Promise<import('$lib/stores/persons').Person>}
 */
export async function getPerson(id) {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Rechercher des personnes par nom (autocomplétion)
 * @param {string} query
 * @returns {Promise<import('$lib/stores/persons').Person[]>}
 */
export async function searchPersons(query) {
  if (!query || query.trim().length < 1) {
    return getPersons();
  }

  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .ilike('name', `%${query.trim()}%`)
    .order('name', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Créer une nouvelle personne
 * @param {{ name: string, phone?: string, email?: string, notes?: string }} params
 * @returns {Promise<import('$lib/stores/persons').Person>}
 */
export async function createPerson({ name, phone, email, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  const personData = {
    user_id: user.id,
    name: name.trim(),
    phone: phone?.trim() || null,
    email: email?.trim() || null,
    notes: notes?.trim() || null
  };

  const { data, error } = await supabase
    .from('persons')
    .insert(personData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une personne
 * @param {string} id
 * @param {{ name?: string, phone?: string, email?: string, notes?: string }} updates
 * @returns {Promise<import('$lib/stores/persons').Person>}
 */
export async function updatePerson(id, updates) {
  /** @type {Record<string, any>} */
  const cleanUpdates = {};

  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.phone !== undefined) cleanUpdates.phone = updates.phone.trim() || null;
  if (updates.email !== undefined) cleanUpdates.email = updates.email.trim() || null;
  if (updates.notes !== undefined) cleanUpdates.notes = updates.notes.trim() || null;

  const { data, error } = await supabase
    .from('persons')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprimer une personne
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deletePerson(id) {
  const { error } = await supabase
    .from('persons')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Vérifier si une personne avec ce nom existe déjà
 * @param {string} name
 * @returns {Promise<import('$lib/stores/persons').Person | null>}
 */
export async function findPersonByName(name) {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .ilike('name', name.trim())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}