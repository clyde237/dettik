<script>
	// OfflineBanner component - Bannière mode hors-ligne
	export let isOffline = false;
</script>

{#if isOffline}
	<div class="offline-banner">
		<div class="banner-content">
			<span class="icon">⚡</span>
			<div class="message">
				<p class="title">Mode hors ligne</p>
				<p class="description">Les modifications seront synchronisées quand vous serez en ligne</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.offline-banner {
		position: sticky;
		top: 0;
		background: linear-gradient(135deg, rgba(251, 146, 60, 0.9), rgba(249, 115, 22, 0.9));
		color: white;
		z-index: 50;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		max-width: 100%;
	}

	.icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.message {
		flex: 1;
	}

	.title {
		margin: 0;
		font-weight: 600;
		font-size: 0.95rem;
	}

	.description {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		opacity: 0.9;
	}

	@media (max-width: 768px) {
		.banner-content {
			padding: 0.75rem 1rem;
		}

		.title {
			font-size: 0.875rem;
		}

		.description {
			font-size: 0.8rem;
		}
	}
</style>
