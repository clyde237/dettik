<script>
	// InstallPrompt component - Prompt installation PWA
	export let show = false;
	export let onInstall = () => {};
	export let onDismiss = () => {};
</script>

{#if show}
	<div class="install-prompt">
		<div class="prompt-content">
			<div class="prompt-icon">📱</div>
			<div class="prompt-text">
				<h3>Installer l'application</h3>
				<p>Accédez à Dettik directement depuis votre écran d'accueil</p>
			</div>
			<div class="prompt-actions">
				<button class="btn-dismiss" on:click={onDismiss}>Plus tard</button>
				<button class="btn-install" on:click={onInstall}>Installer</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.install-prompt {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		right: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		z-index: 50;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.prompt-content {
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.prompt-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.prompt-text {
		flex: 1;
	}

	.prompt-text h3 {
		margin: 0 0 0.25rem;
		font-size: 0.95rem;
	}

	.prompt-text p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.prompt-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.btn-dismiss {
		background: transparent;
		color: var(--text-secondary);
	}

	.btn-install {
		background: var(--primary);
		color: white;
	}

	@media (max-width: 640px) {
		.install-prompt {
			left: 0;
			right: 0;
			bottom: 0;
			border-radius: 0.5rem 0.5rem 0 0;
		}

		.prompt-content {
			flex-wrap: wrap;
		}

		.prompt-actions {
			width: 100%;
		}

		button {
			flex: 1;
		}
	}
</style>
