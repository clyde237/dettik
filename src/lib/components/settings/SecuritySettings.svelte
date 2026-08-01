<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { authErrorMessage } from '$lib/services/auth.service';
  import { resetPasswordSchema, extractErrors } from '$lib/utils/validators';
  import { toastSuccess, toastError } from '$lib/stores/notifications';
  import { ShieldCheck, KeyRound, Loader2 } from '@lucide/svelte';

  // La 2FA TOTP de Supabase n'a pas été reconduite : l'authentification retenue
  // est email + mot de passe. Cette section gère donc le changement de mot de
  // passe, délégué à Clerk.
  const ctx = useClerkContext();

  let showModal = $state(false);
  let currentPassword = $state('');
  let password = $state('');
  let confirm_password = $state('');
  let loading = $state(false);
  let error = $state('');

  function closeModal() {
    showModal = false;
    currentPassword = '';
    password = '';
    confirm_password = '';
    error = '';
  }

  async function handleUpdatePassword() {
    error = '';

    const result = resetPasswordSchema.safeParse({ password, confirm_password });
    if (!result.success) {
      error = Object.values(extractErrors(result.error))[0] ?? 'Mot de passe invalide';
      return;
    }

    if (!ctx.user) {
      error = 'Session expirée, reconnecte-toi.';
      return;
    }

    loading = true;
    try {
      await ctx.user.updatePassword({
        newPassword: password,
        currentPassword: currentPassword || undefined
      });

      closeModal();
      toastSuccess('Mot de passe mis à jour');
    } catch (err) {
      error = authErrorMessage(err);
      toastError('Erreur lors de la mise à jour');
    } finally {
      loading = false;
    }
  }
</script>

<Card>
  <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <ShieldCheck size={18} />
    Sécurité
  </h3>

  {#if !ctx.isLoaded}
    <div class="flex items-center gap-2 text-gray-400">
      <Loader2 size={16} class="animate-spin" />
      <span class="text-sm">Chargement...</span>
    </div>
  {:else}
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p class="text-sm font-medium text-gray-900">Mot de passe</p>
        <p class="text-xs text-gray-500 mt-0.5">
          Modifie le mot de passe de ton compte
        </p>
      </div>

      <Button variant="primary" size="sm" onclick={() => showModal = true}>
        <KeyRound size={14} />
        Modifier
      </Button>
    </div>
  {/if}
</Card>

<!-- Modal changement de mot de passe -->
<Modal bind:open={showModal} title="Modifier le mot de passe" size="sm">
  <div class="space-y-4">
    {#if error}
      <div class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {error}
      </div>
    {/if}

    <Input
      type="password"
      label="Mot de passe actuel"
      bind:value={currentPassword}
      placeholder="••••••••"
    />

    <Input
      type="password"
      label="Nouveau mot de passe"
      bind:value={password}
      placeholder="8 caractères minimum"
    />

    <Input
      type="password"
      label="Confirmer"
      bind:value={confirm_password}
      placeholder="Retapez le mot de passe"
    />

    <div class="flex justify-end gap-3">
      <Button variant="secondary" onclick={closeModal}>
        Annuler
      </Button>
      <Button onclick={handleUpdatePassword} loading={loading}>
        Mettre à jour
      </Button>
    </div>
  </div>
</Modal>
