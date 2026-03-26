<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { CalendarDays, ClipboardList } from '@lucide/svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const council = $derived(data.council)

  const typeLabels: Record<string, string> = {
    NATIONAL: 'National Council',
    REGIONAL: 'Regional Council',
    THEMATIC: 'Thematic Council'
  }
</script>

<svelte:head>
  <title>{council.name} · Gaya OS</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-2xl font-bold leading-tight">{council.name}</h1>
        <Badge variant="outline">{typeLabels[council.type] ?? council.type}</Badge>
      </div>
      <p class="text-sm text-muted-foreground">{council.unitName}</p>
      {#if council.scopeDescription}
        <p class="mt-2 text-sm leading-relaxed">{council.scopeDescription}</p>
      {/if}
    </div>
    <div class="flex shrink-0 flex-wrap gap-2">
      <Button variant="outline" size="sm" href="/nation/councils/{council.id}/sessions">
        <CalendarDays class="size-3.5" />
        Sessions
      </Button>
      <Button variant="outline" size="sm" href="/nation/councils/{council.id}/proposals">
        <ClipboardList class="size-3.5" />
        Proposals
      </Button>
    </div>
  </div>

  <Separator />

  <!-- Members -->
  <div>
    <h2 class="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
      Members ({council.members.length})
    </h2>
    {#if council.members.length === 0}
      <p class="text-sm text-muted-foreground">No members yet.</p>
    {:else}
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {#each council.members as member}
          <a
            href="/nation/citizens/{member.username}"
            class="flex flex-col items-center gap-2 rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors"
          >
            <Avatar.Root class="size-12">
              {#if member.avatarUrl}
                <Avatar.Image src={member.avatarUrl} alt={member.name} />
              {/if}
              <Avatar.Fallback class="text-sm">{member.name.charAt(0).toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
            <div class="min-w-0 w-full">
              <p class="truncate text-sm font-medium leading-tight">{member.name}</p>
              {#if member.representativeAreas.length > 0}
                <p class="truncate text-xs text-muted-foreground">{member.representativeAreas.join(', ')}</p>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
