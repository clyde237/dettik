<script>
  /**
   * @type {{
   *   name?: string,
   *   size?: 'sm' | 'md' | 'lg',
   *   class?: string
   * }}
   */
  let {
    name = '?',
    size = 'md',
    class: className = ''
  } = $props();

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  /** @param {string} str */
  function getInitials(str) {
    return str
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /** @param {string} str */
  function getColor(str) {
    const colors = [
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-teal-100 text-teal-700',
      'bg-indigo-100 text-indigo-700',
      'bg-red-100 text-red-700'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
</script>

<div
  class="rounded-full flex items-center justify-center font-semibold
    {sizes[size]} {getColor(name)} {className}"
>
  {getInitials(name)}
</div>