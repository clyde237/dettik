<script>
  import AppShell from '$lib/components/layout/AppShell.svelte';
  import { setCurrentUserId } from '$lib/stores/session.js';

  let { children, data } = $props();

  // Rend l'ID utilisateur lisible par les stores, y compris hors ligne.
  $effect(() => {
    setCurrentUserId(data.userId);
  });
</script>

<AppShell>
  {@render children()}
</AppShell>
