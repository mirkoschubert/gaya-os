<script lang="ts">
  import '../app.css'
  import type { LayoutData } from './$types'
  import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'

  injectSpeedInsights()

  let {
    data,
    children
  }: { data: LayoutData; children: import('svelte').Snippet } = $props()
</script>

<svelte:head>
  <meta name="theme-color" content="#20bbcc" />
</svelte:head>

{@render children()}
