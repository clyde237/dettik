<script>
	// EmptyState component
	export let title = 'Rien à afficher';
	export let message = '';
	export let icon = '';
</script>

<div class="empty-state">
	{#if icon}
		<div class="icon">{icon}</div>
	{/if}
	<h3>{title}</h3>
	{#if message}
		<p>{message}</p>
	{/if}
	<slot />
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1.5rem;
		text-align: center;
		color: var(--text-secondary);
	}

	.icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	h3 {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
		color: var(--text-primary);
	}

	p {
		margin: 0;
	}
</style>
