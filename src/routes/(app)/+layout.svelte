<script>
  let { children, data } = $props();
</script>

<!-- Pour l'instant un layout simple, on ajoutera AppShell dans M2 -->
<div class="min-h-screen bg-gray-50">
  {@render children()}
</div>