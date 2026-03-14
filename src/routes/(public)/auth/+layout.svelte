<script lang="ts">
  let { children } = $props()
</script>

<div class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
  <div class="w-full max-w-md -mt-14">
    {@render children()}
  </div>
</div>
