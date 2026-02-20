<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';

  onMount(() => {
    setPageTitle('Mes créances', 'Argent qu\'on vous doit');
  });
</script>

<div class="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
  <p>Module 6 — À venir</p>
</div>