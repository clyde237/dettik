<script>
  import { page } from '$app/stores';
  import {
    LayoutDashboard,
    TrendingDown,
    TrendingUp,
    Archive,
    Settings
  } from '@lucide/svelte';

  const navItems = [
    { href: '/', label: 'Accueil', icon: LayoutDashboard },
    { href: '/debts', label: 'Dettes', icon: TrendingDown },
    { href: '/credits', label: 'Créances', icon: TrendingUp },
    { href: '/archives', label: 'Archives', icon: Archive },
    { href: '/settings', label: 'Réglages', icon: Settings }
  ];

  /**
   * @param {string} href
   * @param {string} pathname
   */
  function isActive(href, pathname) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }
</script>

<nav class="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 lg:hidden">
  <div class="flex items-center justify-around h-16 px-2">
    {#each navItems as item}
      {@const active = isActive(item.href, $page.url.pathname)}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center gap-0.5 w-full py-1 rounded-lg transition
          {active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}"
      >
        <item.icon size={20} />
        <span class="text-[10px] font-medium">{item.label}</span>
      </a>
    {/each}
  </div>

  <!-- Safe area pour les iPhones avec encoche -->
  <div class="h-[env(safe-area-inset-bottom)]"></div>
</nav>