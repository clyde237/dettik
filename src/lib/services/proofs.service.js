import { supabase } from '$lib/supabase/client';

/**
 * @typedef {Object} Proof
 * @property {string} id
 * @property {string} payment_id
 * @property {string} file_url
 * @property {string} file_name
 * @property {string} file_type
 * @property {number} file_size
 * @property {string} created_at
 */

/**
 * Uploader un fichier preuve
 * @param {string} paymentId
 * @param {File} file
 * @returns {Promise<Proof>}
 */
export async function uploadProof(paymentId, file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  // Chemin : user_id/payment_id/timestamp_filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${user.id}/${paymentId}/${timestamp}_${safeName}`;

  // 1. Upload dans Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) throw uploadError;

  // 2. Obtenir l'URL signée (valable 1 an)
  const { data: urlData } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);

  const fileUrl = urlData?.signedUrl || filePath;

  // 3. Enregistrer la référence en BDD
  const { data: proof, error: dbError } = await supabase
    .from('payment_proofs')
    .insert({
      payment_id: paymentId,
      file_url: fileUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return proof;
}

/**
 * Supprimer une preuve (fichier + BDD)
 * @param {Proof} proof
 * @returns {Promise<void>}
 */
export async function deleteProof(proof) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  // Extraire le chemin du fichier depuis l'URL
  // Le chemin est user_id/payment_id/filename
  const urlParts = proof.file_url.split('payment-proofs/');
  if (urlParts.length > 1) {
    const filePath = urlParts[1].split('?')[0];

    await supabase.storage
      .from('payment-proofs')
      .remove([filePath]);
  }

  // Supprimer de la BDD
  const { error } = await supabase
    .from('payment_proofs')
    .delete()
    .eq('id', proof.id);

  if (error) throw error;
}

/**
 * Récupérer les preuves d'un versement
 * @param {string} paymentId
 * @returns {Promise<Proof[]>}
 */
export async function getProofs(paymentId) {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('*')
    .eq('payment_id', paymentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Rafraîchir l'URL signée d'une preuve
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function refreshProofUrl(filePath) {
  const { data } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);

  return data?.signedUrl || '';
}