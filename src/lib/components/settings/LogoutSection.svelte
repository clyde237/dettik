<script>
  import Card from '$lib/components/ui/Card.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import { logout } from '$lib/services/auth.service';
  import { supabase } from '$lib/supabase/client';
  import { goto, invalidate } from '$app/navigation';
  import { toastSuccess, toastError } from '$lib/stores/notifications';
  import { LogOut, Trash2 } from '@lucide/svelte';

  let showDeleteAccount = $state(false);

  async function handleLogout() {
    await logout();
    await invalidate('supabase:auth');
    goto('/login');
  }

  async function handleDeleteAccount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toastError('Contactez le support pour supprimer votre compte');
      showDeleteAccount = false;
    } catch (err) {
      toastError('Erreur');
    }
  }
</script>

<Card class="mt-4">
  <div class="space-y-3">
    <button
      onclick={handleLogout}
      class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition text-left"
    >
      <LogOut size={18} class="text-red-500" />
      <div>
        <p class="text-sm font-medium text-red-600">Se déconnecter</p>
        <p class="text-xs text-gray-500">Déconnexion de votre compte</p>
      </div>
    </button>

    <button
      onclick={() => showDeleteAccount = true}
      class="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition text-left"
    >
      <Trash2 size={18} class="text-red-500" />
      <div>
        <p class="text-sm font-medium text-red-600">Supprimer mon compte</p>
        <p class="text-xs text-gray-500">Suppression définitive de toutes vos données</p>
      </div>
    </button>
  </div>
</Card>

<ConfirmDialog
  bind:open={showDeleteAccount}
  title="Supprimer votre compte ?"
  message="Cette action est irréversible. Toutes vos données seront supprimées définitivement."
  confirmLabel="Supprimer mon compte"
  variant="danger"
  onconfirm={handleDeleteAccount}
/>
