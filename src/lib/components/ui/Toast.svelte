<script>
	// Toast component
	export let message = '';
	export let type = 'info';
	export let duration = 3000;

	let visible = true;

	setTimeout(() => {
		visible = false;
	}, duration);
</script>

{#if visible}
	<div class={`toast toast-${type}`}>
		<p>{message}</p>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		padding: 1rem 1.5rem;
		border-radius: 0.375rem;
		color: white;
		z-index: 999;
		animation: slideIn 0.3s ease-out;
	}

	.toast-success {
		background: var(--success);
	}

	.toast-error {
		background: var(--danger);
	}

	.toast-info {
		background: var(--primary);
	}

	.toast-warning {
		background: var(--warning);
	}

	p {
		margin: 0;
	}

	@keyframes slideIn {
		from {
			transform: translateX(400px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
