<script>
  import { page } from '$app/stores';
  import { ui, closeSidebar } from '$lib/stores/ui';
  import {
    LayoutDashboard,
    TrendingDown,
    TrendingUp,
    Archive,
    Settings,
    LogOut,
    X
  } from '@lucide/svelte';
  import { logout } from '$lib/services/auth.service';
  import { goto, invalidate } from '$app/navigation';

  const navItems = [
    { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/debts', label: 'Mes dettes', icon: TrendingDown },
    { href: '/credits', label: 'Mes créances', icon: TrendingUp },
    { href: '/archives', label: 'Archives', icon: Archive },
    { href: '/settings', label: 'Paramètres', icon: Settings }
  ];

  /**
   * @param {string} href
   * @param {string} pathname
   */
  function isActive(href, pathname) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await logout();
    await invalidate('supabase:auth');
    goto('/login');
  }

  /**
   * Naviguer et fermer la sidebar sur mobile
   * @param {string} href
   */
  function navigate(href) {
    closeSidebar();
    goto(href);
  }
</script>

<!-- Overlay mobile -->
{#if $ui.sidebarOpen}
  <button
    class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    onclick={closeSidebar}
    aria-label="Fermer le menu"
  ></button>
{/if}

<!-- Sidebar -->
<aside
  class="fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300
    lg:translate-x-0 lg:static lg:z-auto
    {$ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <!-- Logo -->
  <div class="flex items-center justify-between px-4 h-16 border-b border-gray-100">
    <button onclick={() => navigate('/')} class="flex items-center gap-3">
      <img src="/logo.png" alt="Dettik" class="w-9 h-9 rounded-xl object-cover" />
      <span class="text-lg font-bold text-gray-900">Dettik</span>
    </button>

    <!-- Bouton fermer (mobile) -->
    <button
      class="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition"
      onclick={closeSidebar}
    >
      <X size={20} />
    </button>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
    {#each navItems as item}
      {@const active = isActive(item.href, $page.url.pathname)}
      <button
        onclick={() => navigate(item.href)}
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
          {active
            ? 'bg-green-50 text-green-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
      >
        <item.icon size={20} class={active ? 'text-green-600' : 'text-gray-400'} />
        {item.label}
      </button>
    {/each}
  </nav>

  <!-- Déconnexion -->
  <div class="px-3 py-4 border-t border-gray-100">
    <button
      onclick={handleLogout}
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
    >
      <LogOut size={20} />
      Se déconnecter
    </button>
  </div>
</aside>