<script lang="ts">
  import { useSession } from '$lib/auth-client'
  import type { AppUser } from '$lib/domain/auth'
  import * as Card from '$lib/components/ui/card'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Badge } from '$lib/components/ui/badge'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'
  import { MapPin, Calendar, Users } from '@lucide/svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const session = useSession()
  const currentUser = $derived($session.data?.user as AppUser | undefined)

  let search = $state('')

  const filtered = $derived(
    search.trim()
      ? data.citizens.filter(
          (c) =>
            c.displayName.toLowerCase().includes(search.toLowerCase()) ||
            c.username.toLowerCase().includes(search.toLowerCase())
        )
      : data.citizens
  )

  const filteredCouncils = $derived(
    search.trim()
      ? data.councils.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.scopeDescription ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : data.councils
  )

  const filteredCities = $derived(
    search.trim()
      ? data.cities.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.description ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : data.cities
  )

  const filteredVisitors = $derived(
    search.trim()
      ? data.visitors.filter((v) =>
          v.displayName.toLowerCase().includes(search.toLowerCase()) ||
          (v.username ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : data.visitors
  )

  function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  function initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const typeLabels: Record<string, string> = {
    NATIONAL: 'National Council',
    REGIONAL: 'Regional Council',
    THEMATIC: 'Thematic Council'
  }
</script>

<svelte:head>
  <title>Nation · Gaya OS</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-1">
  <h1 class="text-3xl font-bold tracking-tight">Nation</h1>
  <p class="text-muted-foreground text-sm">
    {data.citizens.length} citizen{data.citizens.length === 1 ? '' : 's'} · {data.visitors.length} visitor{data.visitors.length === 1 ? '' : 's'} · {data.councils.length} council{data.councils.length === 1 ? '' : 's'} · {data.cities.filter((c) => c.active).length} cit{data.cities.filter((c) => c.active).length === 1 ? 'y' : 'ies'}
  </p>
</div>

<Tabs.Root value="cities">
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <Tabs.List>
      <Tabs.Trigger value="cities">
        Cities
        <Badge variant="secondary" class="ml-1.5 text-xs">{data.cities.filter((c) => c.active).length}</Badge>
      </Tabs.Trigger>
      <Tabs.Trigger value="councils">
        Councils
        <Badge variant="secondary" class="ml-1.5 text-xs">{data.councils.length}</Badge>
      </Tabs.Trigger>
      <Tabs.Trigger value="citizens">
        Citizens
        <Badge variant="secondary" class="ml-1.5 text-xs">{data.citizens.length}</Badge>
      </Tabs.Trigger>
      {#if data.visitorsListed}
        <Tabs.Trigger value="visitors">
          Visitors
          <Badge variant="secondary" class="ml-1.5 text-xs">{data.visitors.length}</Badge>
        </Tabs.Trigger>
      {/if}
    </Tabs.List>
    <div class="max-w-sm w-full">
      <Input type="search" placeholder="Search…" bind:value={search} />
    </div>
  </div>

  <!-- Citizens Tab -->
  <Tabs.Content value="citizens">
    {#if filtered.length === 0}
      <p class="text-muted-foreground text-sm">No citizens found.</p>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each filtered as citizen}
          <a href="/nation/citizens/{citizen.username}" class="block group">
            <Card.Root class="h-full transition-shadow group-hover:shadow-md">
              <Card.Content class="flex flex-col items-center gap-3 pt-6 pb-4 text-center">
                <Avatar.Root class="size-16">
                  {#if citizen.avatarUrl}
                    <Avatar.Image src={citizen.avatarUrl} alt={citizen.displayName} />
                  {/if}
                  <Avatar.Fallback class="text-lg">{initials(citizen.displayName)}</Avatar.Fallback>
                </Avatar.Root>
                <div class="min-w-0 w-full">
                  <p class="truncate font-semibold leading-tight">{citizen.displayName}</p>
                  <p class="truncate text-xs text-muted-foreground">@{citizen.username}</p>
                </div>
                <Badge variant="outline" class="font-mono text-xs">{citizen.citizenId}</Badge>
                {#if citizen.cityName}
                  <p class="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin class="size-3 shrink-0" />{citizen.cityName}
                  </p>
                {/if}
                {#if citizen.joinedAt}
                  <p class="text-xs text-muted-foreground">Citizen since {formatDate(citizen.joinedAt)}</p>
                {/if}
                {#if citizen.id === currentUser?.id}
                  <Badge variant="secondary" class="text-xs">You</Badge>
                {/if}
              </Card.Content>
            </Card.Root>
          </a>
        {/each}
      </div>
    {/if}
  </Tabs.Content>

  <!-- Councils Tab -->
  <Tabs.Content value="councils">
    {#if filteredCouncils.length === 0}
      <p class="text-muted-foreground text-sm">No councils found.</p>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each filteredCouncils as council}
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
  </Tabs.Content>

  <!-- Cities Tab -->
  <Tabs.Content value="cities">
    {#if filteredCities.length === 0}
      <p class="text-muted-foreground text-sm">No cities found.</p>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each filteredCities as city}
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
                      <Users class="size-3 mr-1" />{city.memberCount}
                    </Badge>
                  </div>
                  {#if city.description}
                    <p class="mt-2 text-sm text-muted-foreground line-clamp-2">{city.description}</p>
                  {/if}
                  <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <Calendar class="size-3" />
                      Founded {formatDate(city.foundedAt)}
                    </span>
                    {#if city.council}
                      <span class="flex items-center gap-1">
                        <MapPin class="size-3" />{city.council.name}
                      </span>
                    {/if}
                  </div>
                </Card.Content>
              </Card.Root>
            </a>
          {:else}
            <div class="opacity-60 cursor-not-allowed">
              <Card.Root class="h-full overflow-hidden grayscale pt-0">
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
                    <Badge variant="outline" class="shrink-0 text-xs">Inactive</Badge>
                  </div>
                  {#if city.description}
                    <p class="mt-2 text-sm text-muted-foreground line-clamp-2">{city.description}</p>
                  {/if}
                  <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <Calendar class="size-3" />
                      Founded {formatDate(city.foundedAt)}
                    </span>
                    {#if city.council}
                      <span class="flex items-center gap-1">
                        <MapPin class="size-3" />{city.council.name}
                      </span>
                    {/if}
                  </div>
                </Card.Content>
              </Card.Root>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </Tabs.Content>

  <!-- Visitors Tab -->
  <Tabs.Content value="visitors">
    {#if filteredVisitors.length === 0}
      <p class="text-muted-foreground text-sm">No visitors found.</p>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each filteredVisitors as visitor}
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
  </Tabs.Content>
</Tabs.Root>
