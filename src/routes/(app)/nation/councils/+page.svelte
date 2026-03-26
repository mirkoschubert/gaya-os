<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Input } from '$lib/components/ui/input'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let search = $state('')

  const filtered = $derived(
    search.trim()
      ? data.councils.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.scopeDescription ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : data.councils
  )

  const typeLabels: Record<string, string> = {
    NATIONAL: 'National Council',
    REGIONAL: 'Regional Council',
    THEMATIC: 'Thematic Council'
  }
</script>

<svelte:head>
  <title>Councils · Gaya OS</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Councils</h1>
    <p class="text-muted-foreground text-sm">{data.councils.length} council{data.councils.length === 1 ? '' : 's'}</p>
  </div>
  <div class="max-w-sm w-full">
    <Input type="search" placeholder="Search..." bind:value={search} />
  </div>
</div>

{#if filtered.length === 0}
  <p class="text-muted-foreground text-sm">No councils found.</p>
{:else}
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each filtered as council}
      <a href="/nation/councils/{council.id}/profile" class="block group">
        <Card.Root class="h-full overflow-hidden transition-shadow group-hover:shadow-md pt-0">
          <div
            class="aspect-21/9 w-full bg-linear-to-br from-primary/20 to-primary/5"
            style={council.banner ? `background-image: url('${council.banner}'); background-size: cover; background-position: center;` : ''}
          ></div>
          <Card.Content class="pt-4 pb-4">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-semibold leading-tight truncate">{council.name}</p>
                <p class="text-xs text-muted-foreground">{typeLabels[council.type] ?? council.type}</p>
              </div>
              <Badge variant="secondary" class="shrink-0 text-xs">
                {council.memberCount} member{council.memberCount !== 1 ? 's' : ''}
              </Badge>
            </div>
            {#if council.scopeDescription}
              <p class="mt-2 text-sm text-muted-foreground line-clamp-2">{council.scopeDescription}</p>
            {/if}
          </Card.Content>
        </Card.Root>
      </a>
    {/each}
  </div>
{/if}
