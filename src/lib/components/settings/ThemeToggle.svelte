<script>
  import Card from '$lib/components/ui/Card.svelte';
  import { settings, updateSettings } from '$lib/stores/settings';
  import { Sun, Moon, Monitor } from '@lucide/svelte';

  const themes = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor }
  ];

  /**
   * @param {string} theme
   */
  function selectTheme(theme) {
    updateSettings({ theme: /** @type {'light' | 'dark' | 'auto'} */ (theme) });
  }
</script>

<Card>
  <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Sun size={18} />
    Thème
  </h3>

  <div class="grid grid-cols-3 gap-2">
    {#each themes as theme}
      {@const Icon = theme.icon}
      {@const active = $settings.theme === theme.value}
      <button
        type="button"
        onclick={() => selectTheme(theme.value)}
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition
          {active
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'}"
      >
        <Icon size={22} class={active ? 'text-green-600' : 'text-gray-400'} />
        <span class="text-sm font-medium {active ? 'text-green-700' : 'text-gray-600'}">
          {theme.label}
        </span>
      </button>
    {/each}
  </div>
</Card>