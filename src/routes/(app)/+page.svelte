<script>
  import { logout } from '$lib/services/auth.service';
  import { goto } from '$app/navigation';
  import { LogOut } from '@lucide/svelte';

  let { data } = $props();

  async function handleLogout() {
    await logout();
    goto('/login');
  }
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold text-gray-900 mb-4">Bienvenue sur Dettik 👋</h1>
  <p class="text-gray-600 mb-6">Connecté en tant que : {data.session?.user?.email}</p>

  <button
    onclick={handleLogout}
    class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
  >
    <LogOut size={18} />
    Se déconnecter
  </button>
</div>