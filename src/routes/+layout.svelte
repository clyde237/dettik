<script>
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase/client';
  import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
  import './layout.css';

  let { children, data } = $props();

  onMount(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_, session) => {
      invalidate('supabase:auth');
    });

    return () => subscription.unsubscribe();
  });
</script>

{@render children()}
<ToastContainer />