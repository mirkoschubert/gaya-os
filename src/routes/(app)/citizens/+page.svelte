<script lang="ts">
  import { useSession } from '$lib/auth-client'
  import type { AppUser } from '$lib/domain/auth'
  import * as Card from '$lib/components/ui/card'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Badge } from '$lib/components/ui/badge'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'
  import { page } from '$app/state'
  import { Building2, MessageSquare } from '@lucide/svelte'
  import { messagesCommand } from '$lib/stores/messages'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const session = useSession()
  const currentUser = $derived($session.data?.user as AppUser | undefined)
  const myCouncilIds = $derived(
    new Set(
      ((page.data as { councilMemberships?: { councilId: string }[] }).councilMemberships ?? []).map(
        (m) => m.councilId
      )
    )
  )

  async function openCouncilChat(councilId: string) {
    const res = await fetch(`/api/messages/council/${councilId}`, { method: 'POST' })
    if (res.ok) {
      const { channelId } = await res.json()
      messagesCommand.set({ action: 'open', channelId })
    }
  }

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
  <title>Citizens · Gaya OS</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-1">
  <h1 class="text-3xl font-bold tracking-tight">Citizens</h1>
  <p class="text-muted-foreground text-sm">
    {data.citizens.length} citizen{data.citizens.length === 1 ? '' : 's'} of Civitas Gaya
  </p>
</div>

<Tabs.Root value="citizens">
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <Tabs.List>
      <Tabs.Trigger value="citizens">
        Citizens
        <Badge variant="secondary" class="ml-1.5 text-xs">{data.citizens.length}</Badge>
      </Tabs.Trigger>
      <Tabs.Trigger value="councils">
        Councils
        <Badge variant="secondary" class="ml-1.5 text-xs">{data.councils.length}</Badge>
      </Tabs.Trigger>
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
          <a href="/citizens/{citizen.username}" class="block group">
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
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {#each filteredCouncils as council}
          <Card.Root>
            <Card.Header>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                  <Building2 class="size-5 text-muted-foreground shrink-0" />
                  <div>
                    <Card.Title class="text-base">{council.name}</Card.Title>
                    <p class="text-xs text-muted-foreground">{typeLabels[council.type] ?? council.type} - {council.unitName}</p>
                  </div>
                </div>
                <Badge variant="outline" class="shrink-0 text-xs">
                  {council.memberCount} member{council.memberCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            </Card.Header>
            {#if council.scopeDescription || council.members.length > 0}
              <Card.Content class="space-y-4">
                {#if council.scopeDescription}
                  <p class="text-sm text-muted-foreground">{council.scopeDescription}</p>
                {/if}
                {#if council.members.length > 0}
                  <div>
                    <p class="text-xs text-muted-foreground uppercase tracking-wide mb-2">Members</p>
                    <div class="flex flex-wrap gap-2">
                      {#each council.members as member}
                        <a
                          href="/citizens/{member.username}"
                          class="flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs hover:bg-muted/50 transition-colors"
                        >
                          <Avatar.Root class="size-4">
                            {#if member.avatarUrl}
                              <Avatar.Image src={member.avatarUrl} alt={member.name} />
                            {/if}
                            <Avatar.Fallback class="text-[8px]">{member.name.charAt(0).toUpperCase()}</Avatar.Fallback>
                          </Avatar.Root>
                          {member.name}
                          {#if member.representativeAreas.length > 0}
                            <span class="text-muted-foreground">({member.representativeAreas.join(', ')})</span>
                          {/if}
                        </a>
                      {/each}
                    </div>
                  </div>
                {/if}
              </Card.Content>
            {/if}
            {#if !myCouncilIds.has(council.id)}
              <Card.Footer>
                <Button variant="outline" size="sm" class="w-full gap-2" onclick={() => openCouncilChat(council.id)}>
                  <MessageSquare class="size-3.5" />
                  Contact Council
                </Button>
              </Card.Footer>
            {/if}
          </Card.Root>
        {/each}
      </div>
    {/if}
  </Tabs.Content>
</Tabs.Root>
