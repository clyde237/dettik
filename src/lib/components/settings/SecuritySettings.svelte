<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { enrollMFA, unenrollMFA } from '$lib/services/auth.service';
  import { supabase } from '$lib/supabase/client';
  import { toastSuccess, toastError } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { ShieldCheck, ShieldOff, Loader2 } from '@lucide/svelte';

  let mfaEnabled = $state(false);
  let mfaLoading = $state(true);
  let showEnrollModal = $state(false);
  let showDisableModal = $state(false);

  /** @type {string} */
  let qrCode = $state('');
  /** @type {string} */
  let factorId = $state('');
  let verifyCode = $state('');
  let enrollLoading = $state(false);
  let disableLoading = $state(false);
  let enrollError = $state('');

  onMount(async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const totpFactors = data?.totp || [];
      mfaEnabled = totpFactors.length > 0;
      if (mfaEnabled) {
        factorId = totpFactors[0].id;
      }
    } catch (err) {
      console.error(err);
    } finally {
      mfaLoading = false;
    }
  });

  async function handleEnroll() {
    enrollLoading = true;
    enrollError = '';
    try {
      const data = await enrollMFA();
      qrCode = data.totp.qr_code;
      factorId = data.id;
      showEnrollModal = true;
    } catch (err) {
      toastError('Erreur lors de l\'activation 2FA');
      console.error(err);
    } finally {
      enrollLoading = false;
    }
  }

  async function handleVerifyEnroll() {
    if (verifyCode.length !== 6) {
      enrollError = 'Le code doit contenir 6 chiffres';
      return;
    }

    enrollLoading = true;
    enrollError = '';
    try {
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
      if (!challenge) throw new Error('Challenge échoué');

      await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode
      });

      mfaEnabled = true;
      showEnrollModal = false;
      verifyCode = '';
      toastSuccess('Authentification 2FA activée');
    } catch (err) {
      enrollError = 'Code invalide. Réessayez.';
    } finally {
      enrollLoading = false;
    }
  }

  async function handleDisable() {
    disableLoading = true;
    try {
      await unenrollMFA(factorId);
      mfaEnabled = false;
      showDisableModal = false;
      toastSuccess('Authentification 2FA désactivée');
    } catch (err) {
      toastError('Erreur lors de la désactivation');
      console.error(err);
    } finally {
      disableLoading = false;
    }
  }
</script>

<Card>
  <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <ShieldCheck size={18} />
    Sécurité
  </h3>

  {#if mfaLoading}
    <div class="flex items-center gap-2 text-gray-400">
      <Loader2 size={16} class="animate-spin" />
      <span class="text-sm">Chargement...</span>
    </div>
  {:else}
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p class="text-sm font-medium text-gray-900">Authentification à deux facteurs (2FA)</p>
        <p class="text-xs text-gray-500 mt-0.5">
          {mfaEnabled
            ? 'Activée — Votre compte est protégé'
            : 'Désactivée — Ajoutez une couche de sécurité'}
        </p>
      </div>

      {#if mfaEnabled}
        <Button variant="outline" size="sm" onclick={() => showDisableModal = true}>
          <ShieldOff size={14} />
          Désactiver
        </Button>
      {:else}
        <Button variant="primary" size="sm" onclick={handleEnroll} loading={enrollLoading}>
          <ShieldCheck size={14} />
          Activer
        </Button>
      {/if}
    </div>
  {/if}
</Card>

<!-- Modal activation 2FA -->
<Modal bind:open={showEnrollModal} title="Activer la 2FA" size="sm">
  <div class="space-y-4">
    <p class="text-sm text-gray-600">
      Scannez ce QR code avec votre application d'authentification
      (Google Authenticator, Authy, etc.)
    </p>

    {#if qrCode}
      <div class="flex justify-center p-4 bg-white rounded-xl border border-gray-200">
        <img src={qrCode} alt="QR Code 2FA" class="w-48 h-48" />
      </div>
    {/if}

    <p class="text-sm text-gray-600">
      Entrez le code à 6 chiffres généré par l'application :
    </p>

    {#if enrollError}
      <div class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {enrollError}
      </div>
    {/if}

    <Input
      type="text"
      bind:value={verifyCode}
      placeholder="000000"
      class="text-center"
    />

    <div class="flex justify-end gap-3">
      <Button variant="secondary" onclick={() => showEnrollModal = false}>
        Annuler
      </Button>
      <Button onclick={handleVerifyEnroll} loading={enrollLoading}>
        Vérifier et activer
      </Button>
    </div>
  </div>
</Modal>

<!-- Modal désactivation 2FA -->
<Modal bind:open={showDisableModal} title="Désactiver la 2FA" size="sm">
  <div class="space-y-4">
    <p class="text-sm text-gray-600">
      Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ?
      Votre compte sera moins protégé.
    </p>

    <div class="flex justify-end gap-3">
      <Button variant="secondary" onclick={() => showDisableModal = false}>
        Annuler
      </Button>
      <Button variant="danger" onclick={handleDisable} loading={disableLoading}>
        Désactiver
      </Button>
    </div>
  </div>
</Modal>