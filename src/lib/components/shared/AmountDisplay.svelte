<script>
	// AmountDisplay component - Affichage montant formaté
	export let amount = 0;
	export let currency = 'EUR';
	export let size = 'md';
	export let type = 'debt';

	const formatter = new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: currency,
	});
</script>

<span class={`amount amount-${size} amount-${type}`}>
	{formatter.format(amount)}
</span>

<style>
	.amount {
		font-weight: 600;
	}

	.amount-sm {
		font-size: 0.875rem;
	}

	.amount-md {
		font-size: 1rem;
	}

	.amount-lg {
		font-size: 1.5rem;
	}

	.amount-debt {
		color: var(--danger);
	}

	.amount-credit {
		color: var(--success);
	}

	.amount-neutral {
		color: var(--text-primary);
	}
</style>
