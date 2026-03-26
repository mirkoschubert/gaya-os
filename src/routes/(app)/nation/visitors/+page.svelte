<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Badge } from '$lib/components/ui/badge'
  import { Input } from '$lib/components/ui/input'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let search = $state('')

  const filtered = $derived(
    search.trim()
      ? data.visitors.filter(
          (v) =>
            v.displayName.toLowerCase().includes(search.toLowerCase()) ||
            (v.username ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : data.visitors
  )

  function initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
</script>

<svelte:head>
  <title>Visitors · Gaya OS</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Visitors</h1>
    <p class="text-muted-foreground text-sm">{data.visitors.length} visitor{data.visitors.length === 1 ? '' : 's'}</p>
  </div>
  <div class="max-w-sm w-full">
    <Input type="search" placeholder="Search..." bind:value={search} />
  </div>
</div>

{#if filtered.length === 0}
  <p class="text-muted-foreground text-sm">No visitors found.</p>
{:else}
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each filtered as visitor}
      <svelte:element
        this={visitor.hasProfile && visitor.username ? 'a' : 'div'}
        href={visitor.hasProfile && visitor.username ? `/nation/citizens/${visitor.username}` : undefined}
        class="block group"
      >
        <Card.Root class="h-full transition-shadow {visitor.hasProfile ? 'group-hover:shadow-md' : ''}">
          <Card.Content class="flex flex-col items-center gap-3 pt-6 pb-4 text-center">
            <Avatar.Root class="size-16">
              {#if visitor.avatarUrl}
                <Avatar.Image src={visitor.avatarUrl} alt={visitor.displayName} />
              {/if}
              <Avatar.Fallback class="text-lg">{initials(visitor.displayName)}</Avatar.Fallback>
            </Avatar.Root>
            <div class="min-w-0 w-full">
              <p class="truncate font-semibold leading-tight">{visitor.displayName}</p>
              {#if visitor.username}
                <p class="truncate text-xs text-muted-foreground">@{visitor.username}</p>
              {/if}
            </div>
            <Badge variant="outline" class="text-xs">Visitor</Badge>
          </Card.Content>
        </Card.Root>
      </svelte:element>
    {/each}
  </div>
{/if}
