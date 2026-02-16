<script>
	// SearchInput component
	export let value = '';
	export let placeholder = 'Rechercher...';
</script>

<div class="search-input">
	<input
		type="text"
		{placeholder}
		bind:value
		on:input
		on:focus
		on:blur
	/>
	{#if value}
		<button class="clear-btn" on:click={() => (value = '')}>&times;</button>
	{/if}
</div>

<style>
	.search-input {
		position: relative;
		display: flex;
		align-items: center;
	}

	input {
		flex: 1;
		padding: 0.5rem;
		padding-right: 2rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--primary);
	}

	.clear-btn {
		position: absolute;
		right: 0.5rem;
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		color: var(--text-secondary);
	}
</style>
