<script>
  import { formatDate, formatRelative } from '$lib/utils/date';

  /**
   * @type {{
   *   date: string | Date,
   *   relative?: boolean,
   *   format?: 'short' | 'medium' | 'long',
   *   class?: string
   * }}
   */
  let {
    date,
    relative = false,
    format = 'medium',
    class: className = ''
  } = $props();
</script>

<time
  datetime={new Date(date).toISOString()}
  title={formatDate(date, 'long')}
  class={className}
>
  {relative ? formatRelative(date) : formatDate(date, format)}
</time>