<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';

  onMount(() => {
    setPageTitle('Archives', 'Dettes et créances remboursées');
  });
</script>

<div class="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
  <p>Module 9 — À venir</p>
</div>