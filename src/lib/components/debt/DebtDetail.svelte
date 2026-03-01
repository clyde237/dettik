<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import ProgressBar from '$lib/components/shared/ProgressBar.svelte';
  import AmountDisplay from '$lib/components/shared/AmountDisplay.svelte';
  import DateDisplay from '$lib/components/shared/DateDisplay.svelte';
  import StatusBadge from '$lib/components/shared/StatusBadge.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { daysUntil } from '$lib/utils/date';
  import { removeDebt, archiveDebtStore } from '$lib/stores/debts';
  import { goto } from '$app/navigation';
  import {
    Pencil,
    Trash2,
    Archive,
    Plus,
    CalendarClock,
    Percent,
    FileText,
    Phone,
    Mail
  } from '@lucide/svelte';

  /**
   * @type {{
   *   debt: import('$lib/services/debts.service').Debt
   * }}
   */
  let { debt } = $props();

  let showDeleteDialog = $state(false);
  let showArchiveDialog = $state(false);
  let deleteLoading = $state(false);
  let archiveLoading = $state(false);

  let paid = $derived(Number(debt.total_amount) - Number(debt.remaining_amount));
  let personName = $derived(debt.person?.name || 'Inconnu');
  let dueDays = $derived(debt.due_date ? daysUntil(debt.due_date) : null);

  let dueStatus = $derived(
    dueDays === null ? null :
    dueDays < 0 ? 'overdue' :
    dueDays <= 7 ? 'soon' :
    'ok'
  );

  async function handleDelete() {
    deleteLoading = true;
    const success = await removeDebt(debt.id);
    deleteLoading = false;
    if (success) {
      showDeleteDialog = false;
      goto('/debts');
    }
  }

  async function handleArchive() {
    archiveLoading = true;
    const success = await archiveDebtStore(debt.id);
    archiveLoading = false;
    if (success) {
      showArchiveDialog = false;
      goto('/debts');
    }
  }
</script>

<div class="space-y-6">
  <!-- En-tête -->
  <Card>
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-4">
        <Avatar name={personName} size="lg" />
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{personName}</h2>
          <div class="flex items-center gap-2 mt-1">
            <StatusBadge status={debt.status} />
            {#if dueStatus === 'overdue'}
              <Badge variant="danger" size="sm">
                <CalendarClock size={10} />
                En retard de {Math.abs(dueDays || 0)} jours
              </Badge>
            {:else if dueStatus === 'soon'}
              <Badge variant="warning" size="sm">
                <CalendarClock size={10} />
                Échéance dans {dueDays}j
              </Badge>
            {/if}
          </div>
        </div>
      </div>

      <!-- Actions -->
      {#if debt.status === 'active'}
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" onclick={() => goto(`/debts/${debt.id}/edit`)}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="sm" onclick={() => showArchiveDialog = true}>
            <Archive size={14} />
          </Button>
          <Button variant="ghost" size="sm" onclick={() => showDeleteDialog = true}>
            <Trash2 size={14} class="text-red-500" />
          </Button>
        </div>
      {/if}
    </div>

    <!-- Montants -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Montant total</p>
        <AmountDisplay amount={Number(debt.total_amount)} currency={debt.currency} size="sm" />
      </div>
      <div class="text-center p-3 bg-green-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Déjà payé</p>
        <AmountDisplay amount={paid} currency={debt.currency} size="sm" />
      </div>
      <div class="text-center p-3 bg-red-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Reste à payer</p>
        <AmountDisplay amount={Number(debt.remaining_amount)} currency={debt.currency} size="sm" />
      </div>
    </div>

    <!-- Progression -->
    <ProgressBar value={paid} max={Number(debt.total_amount)} />
  </Card>

  <!-- Informations détaillées -->
  <Card>
    <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations</h3>

    <div class="space-y-3">
      <!-- Date d'emprunt -->
      <div class="flex items-center justify-between py-2 border-b border-gray-50">
        <span class="text-sm text-gray-500">Date d'emprunt</span>
        <DateDisplay date={debt.loan_date} class="text-sm font-medium text-gray-900" />
      </div>

      <!-- Échéance -->
      {#if debt.due_date}
        <div class="flex items-center justify-between py-2 border-b border-gray-50">
          <span class="text-sm text-gray-500">Échéance</span>
          <div class="flex items-center gap-2">
            <DateDisplay date={debt.due_date} class="text-sm font-medium text-gray-900" />
            {#if dueDays !== null}
              <span class="text-xs {dueDays < 0 ? 'text-red-500' : 'text-gray-400'}">
                ({dueDays < 0 ? `${Math.abs(dueDays)}j en retard` : `dans ${dueDays}j`})
              </span>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Taux d'intérêt -->
      {#if debt.interest_rate}
        <div class="flex items-center justify-between py-2 border-b border-gray-50">
          <span class="text-sm text-gray-500 flex items-center gap-1">
            <Percent size={14} />
            Taux d'intérêt
          </span>
          <span class="text-sm font-medium text-gray-900">{debt.interest_rate}%</span>
        </div>
      {/if}

      <!-- Devise -->
      <div class="flex items-center justify-between py-2 border-b border-gray-50">
        <span class="text-sm text-gray-500">Devise</span>
        <span class="text-sm font-medium text-gray-900">{debt.currency}</span>
      </div>

      <!-- Description -->
      {#if debt.description}
        <div class="py-2">
          <span class="text-sm text-gray-500 flex items-center gap-1 mb-1">
            <FileText size={14} />
            Description
          </span>
          <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            {debt.description}
          </p>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Infos personne -->
  {#if debt.person?.phone || debt.person?.email}
    <Card>
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Contact</h3>

      <div class="space-y-3">
        {#if debt.person?.phone}
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Phone size={14} class="text-gray-500" />
            </div>
            <a href="tel:{debt.person.phone}" class="text-sm text-green-600 hover:underline">
              {debt.person.phone}
            </a>
          </div>
        {/if}

        {#if debt.person?.email}
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail size={14} class="text-gray-500" />
            </div>
            <a href="mailto:{debt.person.email}" class="text-sm text-green-600 hover:underline">
              {debt.person.email}
            </a>
          </div>
        {/if}
      </div>
    </Card>
  {/if}

  <!-- Bouton ajouter un versement -->
  {#if debt.status === 'active' && Number(debt.remaining_amount) > 0}
    <Button
      variant="primary"
      size="lg"
      class="w-full"
      onclick={() => goto(`/debts/${debt.id}/payment`)}
    >
      <Plus size={18} />
      Ajouter un versement
    </Button>
  {/if}
</div>

<!-- Dialog suppression -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Supprimer cette dette ?"
  message="Cette action est irréversible. La dette et tous ses versements seront supprimés définitivement."
  confirmLabel="Supprimer"
  variant="danger"
  loading={deleteLoading}
  onconfirm={handleDelete}
/>

<!-- Dialog archivage -->
<ConfirmDialog
  bind:open={showArchiveDialog}
  title="Archiver cette dette ?"
  message="La dette sera déplacée dans les archives. Vous pourrez la restaurer plus tard."
  confirmLabel="Archiver"
  variant="warning"
  loading={archiveLoading}
  onconfirm={handleArchive}
/>