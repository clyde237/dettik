<script>
  import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from '@lucide/svelte';
  import { removeToast } from '$lib/stores/notifications';

  /**
   * @type {{
   *   id: string,
   *   type: 'success' | 'error' | 'warning' | 'info',
   *   message: string
   * }}
   */
  let { id, type, message } = $props();

  const config = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  /** @type {Record<string, import('svelte').Component>} */
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  let currentConfig = $derived(config[type] || config.info);
  let CurrentIcon = $derived(icons[type] || icons.info);
</script>

<div class="flex items-start gap-3 p-4 rounded-xl border shadow-lg {currentConfig.bg}">
  <CurrentIcon size={20} class={currentConfig.iconColor} />
  <p class="flex-1 text-sm font-medium {currentConfig.text}">{message}</p>
  <button
    onclick={() => removeToast(id)}
    class="text-gray-400 hover:text-gray-600 transition"
  >
    <X size={16} />
  </button>
</div>