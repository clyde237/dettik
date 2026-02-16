<script>
	// Input component
	export let type = 'text';
	export let placeholder = '';
	export let value = '';
	export let disabled = false;
</script>

<input
	{type}
	{placeholder}
	{value}
	{disabled}
	on:change
	on:input
	on:blur
	on:focus
	class="input"
/>

<style>
	.input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.input:focus {
		outline: none;
		border-color: var(--primary);
	}

	.input:disabled {
		background: var(--bg-disabled);
		cursor: not-allowed;
	}
</style>
