<script>
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';
  import { TriangleAlert } from '@lucide/svelte';

  /**
   * @type {{
   *   open?: boolean,
   *   title?: string,
   *   message?: string,
   *   confirmLabel?: string,
   *   cancelLabel?: string,
   *   variant?: 'danger' | 'warning',
   *   loading?: boolean,
   *   onconfirm?: () => void,
   *   oncancel?: () => void
   * }}
   */
  let {
    open = $bindable(false),
    title = 'Confirmation',
    message = 'Êtes-vous sûr ?',
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'danger',
    loading = false,
    onconfirm,
    oncancel
  } = $props();

  function handleCancel() {
    open = false;
    oncancel?.();
  }

  function handleConfirm() {
    onconfirm?.();
  }
</script>

<Modal bind:open size="sm" onclose={handleCancel}>
  <div class="text-center">
    <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4
      {variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}">
      <TriangleAlert size={24} class={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'} />
    </div>

    <h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p class="text-sm text-gray-500">{message}</p>
  </div>

  {#snippet footer()}
    <Button variant="secondary" onclick={handleCancel} disabled={loading}>
      {cancelLabel}
    </Button>
    <Button
      variant={variant === 'danger' ? 'danger' : 'primary'}
      onclick={handleConfirm}
      {loading}
    >
      {confirmLabel}
    </Button>
  {/snippet}
</Modal>