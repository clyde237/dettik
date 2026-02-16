<script>
	// Badge component
	export let variant = 'primary';
</script>

<span class={`badge badge-${variant}`}>
	<slot />
</span>

<style>
	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.badge-primary {
		background: var(--primary);
		color: white;
	}

	.badge-success {
		background: var(--success);
		color: white;
	}

	.badge-danger {
		background: var(--danger);
		color: white;
	}

	.badge-warning {
		background: var(--warning);
		color: white;
	}
</style>
