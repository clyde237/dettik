<script>
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import BottomNav from './BottomNav.svelte';
  import PageContainer from './PageContainer.svelte';

  /** @type {{ children: import('svelte').Snippet, actions?: import('svelte').Snippet }} */
  let { children, actions } = $props();
</script>

<div class="flex h-screen bg-gray-50">
  <!-- Sidebar (desktop: toujours visible, mobile: overlay) -->
  <Sidebar />

  <!-- Zone principale -->
  <div class="flex-1 flex flex-col min-h-0 w-full">
    <!-- Header -->
    <Header {actions} />

    <!-- Contenu de la page -->
    <PageContainer>
      {@render children()}
    </PageContainer>
  </div>

  <!-- Navigation mobile -->
  <BottomNav />
</div>