<script>
  /**
   * @type {{
   *   width?: string,
   *   height?: string,
   *   rounded?: 'sm' | 'md' | 'lg' | 'full',
   *   class?: string
   * }}
   */
  let {
    width = 'w-full',
    height = 'h-4',
    rounded = 'md',
    class: className = ''
  } = $props();

  const roundedMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
</script>

<div class="animate-pulse bg-gray-200 {width} {height} {roundedMap[rounded]} {className}"></div>