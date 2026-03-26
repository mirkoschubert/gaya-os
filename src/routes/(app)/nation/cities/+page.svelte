<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
</script>

<svelte:head>
  <title>Cities · Gaya OS</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-1">
  <h1 class="text-3xl font-bold tracking-tight">Cities</h1>
  <p class="text-muted-foreground text-sm">
    {data.cities.filter((c) => c.active).length} active {data.cities.filter((c) => c.active).length === 1 ? 'city' : 'cities'} of Civitas Gaya
  </p>
</div>

{#if data.cities.length === 0}
  <p class="text-muted-foreground text-sm">No cities have been founded yet.</p>
{:else}
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.cities as city}
      {#if city.active}
        <a href="/nation/cities/{city.slug}" class="block group">
          <Card.Root class="h-full overflow-hidden transition-shadow group-hover:shadow-md pt-0">
            <div
              class="aspect-21/9 w-full bg-linear-to-br from-primary/20 to-primary/5"
              style={city.banner ? `background-image: url('${city.banner}'); background-size: cover; background-position: center;` : ''}
            ></div>
            <Card.Content class="pt-4 pb-4">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-semibold leading-tight truncate">{city.name}</p>
                  <p class="text-xs text-muted-foreground font-mono">#{city.slug}</p>
                </div>
                <Badge variant="secondary" class="shrink-0 text-xs">
                  {city.memberCount} {city.memberCount === 1 ? 'member' : 'members'}
                </Badge>
              </div>
              {#if city.description}
                <p class="mt-2 text-sm text-muted-foreground line-clamp-2">{city.description}</p>
              {/if}
              <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Founded {formatDate(city.foundedAt)}</span>
                {#if city.council}
                  <span class="font-medium">{city.council.name}</span>
                {/if}
              </div>
            </Card.Content>
          </Card.Root>
        </a>
      {:else}
        <div class="block opacity-60 cursor-not-allowed">
          <Card.Root class="h-full overflow-hidden pt-0">
            <div
              class="aspect-21/9 w-full bg-linear-to-br from-muted/40 to-muted/20"
              style={city.banner ? `background-image: url('${city.banner}'); background-size: cover; background-position: center; filter: grayscale(1);` : ''}
            ></div>
            <Card.Content class="pt-4 pb-4">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-semibold leading-tight truncate">{city.name}</p>
                  <p class="text-xs text-muted-foreground font-mono">#{city.slug}</p>
                </div>
                <Badge variant="outline" class="shrink-0 text-xs">Inactive</Badge>
              </div>
              {#if city.description}
                <p class="mt-2 text-sm text-muted-foreground line-clamp-2">{city.description}</p>
              {/if}
              <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Coming soon</span>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      {/if}
    {/each}
  </div>
{/if}
