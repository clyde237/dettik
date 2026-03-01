<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';
  import ArchiveList from '$lib/components/archive/ArchiveList.svelte';

  onMount(() => {
    setPageTitle('Archives', 'Dettes et créances remboursées');
  });
</script>

<ArchiveList />