<script lang="ts">
  import { useSession } from '$lib/auth-client'
  import type { AppUser } from '$lib/domain/auth'
  import * as Card from '$lib/components/ui/card'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Badge } from '$lib/components/ui/badge'
  import { Input } from '$lib/components/ui/input'
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
</script>

<svelte:head>
  <title>Citizens · Gaya OS</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-1">
  <h1 class="text-3xl font-bold tracking-tight">Citizens</h1>
  <p class="text-muted-foreground text-sm">{data.citizens.length} citizen{data.citizens.length === 1 ? '' : 's'} of Civitas Gaya</p>
</div>

<div class="mb-6 max-w-sm">
  <Input
    type="search"
    placeholder="Search citizens…"
    bind:value={search}
  />
</div>

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
            <p class="text-xs text-muted-foreground">Citizen since {formatDate(citizen.joinedAt)}</p>
            {#if citizen.id === currentUser?.id}
              <Badge variant="secondary" class="text-xs">You</Badge>
            {/if}
          </Card.Content>
        </Card.Root>
      </a>
    {/each}
  </div>
{/if}
