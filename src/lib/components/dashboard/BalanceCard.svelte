<script>
	// BalanceCard component - Solde net
	export let balance = 0;
	export let debts = 0;
	export let credits = 0;
</script>

<div class={`balance-card ${balance >= 0 ? 'positive' : 'negative'}`}>
	<h2>Solde net</h2>
	<div class="balance-value">{balance}€</div>
	<div class="breakdown">
		<div class="item">
			<span>Dettes</span>
			<span class="amount debt">{debts}€</span>
		</div>
		<div class="item">
			<span>Créances</span>
			<span class="amount credit">{credits}€</span>
		</div>
	</div>
</div>

<style>
	.balance-card {
		padding: 2rem;
		background: var(--bg-secondary);
		border-radius: 0.5rem;
		border: 2px solid var(--border-color);
	}

	.balance-card.positive {
		border-color: var(--success);
	}

	.balance-card.negative {
		border-color: var(--danger);
	}

	h2 {
		margin: 0 0 1rem;
		font-size: 1rem;
		color: var(--text-secondary);
		text-transform: uppercase;
	}

	.balance-value {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}

	.balance-card.positive .balance-value {
		color: var(--success);
	}

	.balance-card.negative .balance-value {
		color: var(--danger);
	}

	.breakdown {
		display: flex;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-color);
	}

	.item {
		flex: 1;
		display: flex;
		justify-content: space-between;
	}

	.amount {
		font-weight: 600;
	}

	.debt {
		color: var(--danger);
	}

	.credit {
		color: var(--success);
	}
</style>
