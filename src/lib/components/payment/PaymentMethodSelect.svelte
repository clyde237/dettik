<script>
	// PaymentMethodSelect component - Sélecteur méthode paiement
	export let value = '';
</script>

<div class="payment-method-select">
	<select bind:value on:change>
		<option value="">-- Sélectionner une méthode --</option>
		<option value="cash">💵 Espèces</option>
		<option value="card">💳 Carte bancaire</option>
		<option value="transfer">🔄 Virement</option>
		<option value="check">✓ Chèque</option>
		<option value="digital">📱 Portefeuille digital</option>
	</select>
</div>

<style>
	.payment-method-select {
		width: 100%;
	}

	select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		font-size: 1rem;
	}

	select:focus {
		outline: none;
		border-color: var(--primary);
	}
</style>
