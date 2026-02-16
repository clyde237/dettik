<script>
	// En-tête avec titre + actions
	export let title = '';
</script>

<header class="header">
	<h1>{title}</h1>
	<div class="actions">
		<slot />
	</div>
</header>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}
</style>
