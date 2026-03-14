<script lang="ts">
  import Header from '$lib/components/Header.svelte'

  let { children } = $props()
</script>

<Header />
<main class="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl px-4 py-10">
  {@render children()}
</main>
