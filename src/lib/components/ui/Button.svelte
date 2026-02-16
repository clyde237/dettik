<script>
	// Button component
	export let variant = 'primary';
	export let size = 'md';
	export let disabled = false;
</script>

<button class={`btn btn-${variant} btn-${size}`} {disabled} on:click>
	<slot />
</button>

<style>
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
	}

	.btn-secondary {
		background: var(--secondary);
		color: white;
	}

	.btn-md {
		font-size: 1rem;
	}
</style>
