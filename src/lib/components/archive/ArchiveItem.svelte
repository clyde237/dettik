<script>
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { formatDate } from '$lib/utils/date';
  import { RotateCcw, Trash2, TrendingDown, TrendingUp } from '@lucide/svelte';

  /**
   * @type {{
   *   item: import('$lib/services/debts.service').Debt,
   *   onrestore?: (id: string) => void,
   *   ondelete?: (id: string) => void
   * }}
   */
  let { item, onrestore, ondelete } = $props();

  let showDeleteDialog = $state(false);
  let showRestoreDialog = $state(false);

  let personName = $derived(item.person?.name || 'Inconnu');
  let isDebt = $derived(item.type === 'debt');
</script>

<div class="bg-white rounded-xl border border-gray-200 p-4">
  <div class="flex items-start justify-between">
    <!-- Infos -->
    <div class="flex items-center gap-3 min-w-0">
      <Avatar name={personName} size="md" />
      <div class="min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate">{personName}</p>
        <div class="flex items-center gap-2 mt-1">
          <Badge variant={isDebt ? 'danger' : 'success'} size="sm">
            {#if isDebt}
              <TrendingDown size={10} />
              Dette
            {:else}
              <TrendingUp size={10} />
              Créance
            {/if}
          </Badge>
          {#if item.description}
            <span class="text-xs text-gray-400 truncate">{item.description}</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Montant -->
    <div class="text-right flex-shrink-0 ml-3">
      <p class="text-sm font-bold text-gray-900">
        {formatAmount(Number(item.total_amount), item.currency)}
      </p>
      {#if item.archived_at}
        <p class="text-xs text-gray-400">
          {formatDate(item.archived_at, 'short')}
        </p>
      {/if}
    </div>
  </div>

  <!-- Actions -->
  <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
    <Button variant="ghost" size="sm" onclick={() => showRestoreDialog = true}>
      <RotateCcw size={14} class="text-green-600" />
      <span class="text-green-600">Restaurer</span>
    </Button>
    <Button variant="ghost" size="sm" onclick={() => showDeleteDialog = true}>
      <Trash2 size={14} class="text-red-500" />
      <span class="text-red-500">Supprimer</span>
    </Button>
  </div>
</div>

<!-- Dialog restauration -->
<ConfirmDialog
  bind:open={showRestoreDialog}
  title="Restaurer cet élément ?"
  message="L'élément sera remis dans la liste active."
  confirmLabel="Restaurer"
  variant="warning"
  onconfirm={() => { showRestoreDialog = false; onrestore?.(item.id); }}
/>

<!-- Dialog suppression -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Supprimer définitivement ?"
  message="Cette action est irréversible. L'élément et tous ses versements seront supprimés."
  confirmLabel="Supprimer"
  variant="danger"
  onconfirm={() => { showDeleteDialog = false; ondelete?.(item.id); }}
/>