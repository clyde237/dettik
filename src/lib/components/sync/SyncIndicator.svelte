<script>
	// SyncIndicator component - Indicateur dans le header
	export let syncStatus = 'synced';
</script>

<div class={`sync-indicator sync-${syncStatus}`}>
	{#if syncStatus === 'syncing'}
		<span class="spinner">⟳</span>
		<span>Synchronisation...</span>
	{:else if syncStatus === 'synced'}
		<span>✓</span>
		<span>Synchronisé</span>
	{:else if syncStatus === 'error'}
		<span>⚠</span>
		<span>Erreur de sync</span>
	{:else if syncStatus === 'offline'}
		<span>⚡</span>
		<span>Hors ligne</span>
	{/if}
</div>

<style>
	.sync-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.sync-synced {
		background: rgba(34, 197, 94, 0.1);
		color: var(--success);
	}

	.sync-syncing {
		background: rgba(59, 130, 246, 0.1);
		color: var(--primary);
	}

	.sync-error {
		background: rgba(239, 68, 68, 0.1);
		color: var(--danger);
	}

	.sync-offline {
		background: rgba(251, 146, 60, 0.1);
		color: var(--warning);
	}

	.spinner {
		display: inline-block;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
