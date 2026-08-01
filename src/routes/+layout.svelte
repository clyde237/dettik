<script>
  import { ClerkProvider } from 'svelte-clerk';
  import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
  import InstallPrompt from '$lib/components/shared/InstallPrompt.svelte';
  import UpdateBanner from '$lib/components/sync/UpdateBanner.svelte';
  import './layout.css';

  let { children } = $props();
</script>

<ClerkProvider>
  <UpdateBanner />
  {@render children()}
  <ToastContainer />
  <InstallPrompt />
</ClerkProvider>
