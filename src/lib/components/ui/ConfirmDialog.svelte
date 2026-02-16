<script>
	// ConfirmDialog component
	export let open = false;
	export let title = '';
	export let message = '';
	export let confirmText = 'Confirmer';
	export let cancelText = 'Annuler';

	export let onConfirm = () => {};
	export let onCancel = () => {};
</script>

{#if open}
	<div class="dialog-backdrop">
		<div class="dialog">
			<div class="dialog-header">
				<h2>{title}</h2>
			</div>
			<div class="dialog-body">
				<p>{message}</p>
			</div>
			<div class="dialog-footer">
				<button class="btn-cancel" on:click={onCancel}>{cancelText}</button>
				<button class="btn-confirm" on:click={onConfirm}>{confirmText}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1001;
	}

	.dialog {
		background: var(--bg-primary);
		border-radius: 0.5rem;
		max-width: 400px;
		width: 90%;
	}

	.dialog-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.dialog-header h2 {
		margin: 0;
	}

	.dialog-body {
		padding: 1.5rem;
	}

	.dialog-body p {
		margin: 0;
		color: var(--text-secondary);
	}

	.dialog-footer {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid var(--border-color);
	}

	button {
		flex: 1;
		padding: 0.5rem;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-cancel {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.btn-confirm {
		background: var(--primary);
		color: white;
	}
</style>
