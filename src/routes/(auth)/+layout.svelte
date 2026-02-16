<script>
	let { children } = $props();
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-8"
>
	<!-- Zone Logo -->
	<div class="mb-8 text-center">
		<!-- Remplace par ton image : <img src="/logo.png" alt="Dettik" class="h-16 mx-auto mb-3" /> -->
		<div
			class="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-green-100 shadow-lg shadow-green-500/30"
		>
			<img src="/logo.png" alt="Dettik" class="h-full w-full object-cover" />
		</div>
		<h1 class="text-3xl font-bold text-gray-900">Dettik</h1>
		<p class="mt-1 text-sm text-gray-500">Gestion de dettes et créances</p>
	</div>

	<!-- Contenu de la page -->
	<div class="w-full max-w-md">
		{@render children()}
	</div>

	<!-- Footer -->
	<p class="mt-8 text-xs text-gray-400">© 2025 Dettik. Tous droits réservés.</p>
</div>
