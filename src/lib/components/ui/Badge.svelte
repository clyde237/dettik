<script>
  /**
   * @type {{
   *   variant?: 'default' | 'success' | 'danger' | 'warning' | 'info',
   *   size?: 'sm' | 'md',
   *   class?: string,
   *   children: import('svelte').Snippet
   * }}
   */
  let {
    variant = 'default',
    size = 'sm',
    class: className = '',
    children
  } = $props();

  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-yellow-50 text-yellow-700',
    info: 'bg-blue-50 text-blue-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
</script>

<span class="inline-flex items-center gap-1 font-medium rounded-full {variants[variant]} {sizes[size]} {className}">
  {@render children()}
</span>