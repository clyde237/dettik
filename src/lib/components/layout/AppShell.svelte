<script>
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import BottomNav from './BottomNav.svelte';
  import PageContainer from './PageContainer.svelte';
  import OfflineBanner from '$lib/components/sync/OfflineBanner.svelte';
  import { onMount } from 'svelte';
  import { initOnlineDetection } from '$lib/sync/online.js';
  import { initSyncEngine } from '$lib/sync/engine.js';

  let { children, actions } = $props();

  onMount(() => {
    const cleanupOnline = initOnlineDetection();
    const cleanupSync = initSyncEngine();

    return () => {
      cleanupOnline();
      cleanupSync();
    };
  });
</script>

<div class="flex h-screen bg-gray-50">
  <Sidebar />

  <div class="flex-1 flex flex-col min-h-0 w-full">
    <!-- Bandeau hors-ligne / sync -->
    <OfflineBanner />

    <Header {actions} />

    <PageContainer>
      {@render children()}
    </PageContainer>
  </div>

  <BottomNav />
</div>