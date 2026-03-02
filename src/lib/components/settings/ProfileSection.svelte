<script>
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
    import { getProfile, updateProfile } from '$lib/services/auth.service';
  import { toastSuccess, toastError } from '$lib/stores/notifications';
  import { User, Save, Loader2 } from '@lucide/svelte';

  /** @type {{ full_name: string, email: string } | null} */
  let profile = $state(null);
  let loading = $state(true);
  let saveLoading = $state(false);
  let fullName = $state('');

  onMount(async () => {
    try {
      profile = await getProfile();
      fullName = profile?.full_name || '';
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  });

  async function handleSave() {
    if (!fullName.trim()) return;
    saveLoading = true;
    try {
      await updateProfile({ full_name: fullName.trim() });
      toastSuccess('Profil mis à jour');
    } catch (err) {
      toastError('Erreur lors de la mise à jour');
    } finally {
      saveLoading = false;
    }
  }

</script>

<Card>
  <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <User size={18} />
    Profil
  </h3>

  {#if loading}
    <div class="flex items-center gap-2 text-gray-400">
      <Loader2 size={16} class="animate-spin" />
      <span class="text-sm">Chargement...</span>
    </div>
  {:else if profile}
    <div class="space-y-4">
      <!-- Avatar + email -->
      <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <Avatar name={fullName || profile.email} size="lg" />
        <div>
          <p class="text-sm font-medium text-gray-900">{fullName || 'Sans nom'}</p>
          <p class="text-xs text-gray-500">{profile.email}</p>
        </div>
      </div>

      <!-- Modifier le nom -->
      <div class="flex items-end gap-3">
        <div class="flex-1">
          <Input
            label="Nom complet"
            bind:value={fullName}
            placeholder="Votre nom"
          />
        </div>
        <Button onclick={handleSave} loading={saveLoading} size="md">
          <Save size={14} />
          Sauver
        </Button>
      </div>
    </div>
  {/if}
</Card>


