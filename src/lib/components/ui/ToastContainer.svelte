<script>
  import { toasts } from '$lib/stores/notifications';
  import Toast from './Toast.svelte';
</script>

{#if $toasts.length > 0}
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
    {#each $toasts as toast (toast.id)}
      <Toast id={toast.id} type={toast.type} message={toast.message} />
    {/each}
  </div>
{/if}