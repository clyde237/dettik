<script>
  import { formatAmount } from '$lib/utils/currency';

  /**
   * @type {{
   *   amount: number,
   *   currency?: string,
   *   size?: 'sm' | 'md' | 'lg',
   *   colored?: boolean,
   *   class?: string
   * }}
   */
  let {
    amount = 0,
    currency = 'XAF',
    size = 'md',
    colored = false,
    class: className = ''
  } = $props();

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl'
  };

  let colorClass = $derived(
    !colored ? 'text-gray-900' :
    amount > 0 ? 'text-green-600' :
    amount < 0 ? 'text-red-600' :
    'text-gray-500'
  );
</script>

<span class="font-semibold {sizes[size]} {colorClass} {className}">
  {formatAmount(amount, currency)}
</span>