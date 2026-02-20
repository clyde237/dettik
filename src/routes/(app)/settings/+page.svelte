<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';

  onMount(() => {
    setPageTitle('Paramètres', 'Configuration de l\'application');
  });
</script>

<div class="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
  <p>Module 10 — À venir</p>
</div>