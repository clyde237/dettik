<script>
	// StatusBadge component - Badge statut (actif/archivé)
	export let status = 'active';
</script>

<span class={`status-badge status-${status}`}>
	{#if status === 'active'}
		✓ Actif
	{:else if status === 'archived'}
		📦 Archivé
	{:else if status === 'completed'}
		✓ Complété
	{:else if status === 'pending'}
		⏳ En attente
	{/if}
</span>

<style>
	.status-badge {
		display: inline-block;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.status-active {
		background: rgba(34, 197, 94, 0.1);
		color: var(--success);
	}

	.status-archived {
		background: rgba(107, 114, 128, 0.1);
		color: var(--text-secondary);
	}

	.status-completed {
		background: rgba(34, 197, 94, 0.1);
		color: var(--success);
	}

	.status-pending {
		background: rgba(251, 146, 60, 0.1);
		color: var(--warning);
	}
</style>
