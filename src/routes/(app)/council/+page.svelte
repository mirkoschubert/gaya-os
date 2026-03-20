<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold">Councils</h1>
    <p class="text-muted-foreground">Select a council to view its details.</p>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    {#each data.councilMemberships as membership}
      <a
        href="/council/{membership.councilId}"
        class="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
      >
        <p class="font-semibold">{membership.councilName}</p>
        <p class="text-sm text-muted-foreground">{membership.unitName}</p>
      </a>
    {/each}
  </div>
</div>
