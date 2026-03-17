<script lang="ts">
  import { useSession } from '$lib/auth-client'
  import { page } from '$app/state'
  import type { AppUser } from '$lib/domain/auth'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { MapPin, Link as LinkIcon, Calendar, Pencil } from '@lucide/svelte'
  import { buildLogSentence, formatRoles } from '$lib/domain/audit'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const session = useSession()
  const currentUser = $derived($session.data?.user as AppUser | undefined)
  const isOwnProfile = $derived(currentUser?.id === data.citizen.id)
  const caps = $derived((page.data as { caps?: Record<string, boolean> }).caps ?? {})
  const canEditOwnProfile = $derived(caps['can_edit_own_profile'] ?? false)

  function formatTimestamp(d: Date | string): string {
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
  <title>@{data.citizen.username} · Gaya OS</title>
</svelte:head>

<!-- Profile layout: negative margin to break out of p-6 padding -->
<div class="-mx-6 -mt-6">
  <!-- Hero Banner -->
  <div
    class="flex h-64 w-full items-end justify-end p-3 bg-linear-to-br from-primary/20 to-primary/5"
    style={data.citizen.heroUrl ? `background-image: url('${data.citizen.heroUrl}'); background-size: cover; background-position: center;` : ''}
  >
    {#if isOwnProfile && canEditOwnProfile}
      <Button variant="secondary" size="sm" href="/settings/profile">
        <Pencil class="size-3.5" />
        Edit Profile
      </Button>
    {/if}
  </div>

  <!-- Avatar + Identity row -->
  <div class="px-6">
    <div class="-mt-12 mb-4 inline-block">
      <Avatar.Root class="size-24 border-4 border-background shadow-md">
        {#if data.citizen.avatarUrl}
          <Avatar.Image src={data.citizen.avatarUrl} alt={data.citizen.displayName} />
        {/if}
        <Avatar.Fallback class="text-2xl">{initials(data.citizen.displayName)}</Avatar.Fallback>
      </Avatar.Root>
    </div>

    <!-- Name, handle, badges -->
    <div class="mb-4">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-2xl font-bold leading-tight">{data.citizen.displayName}</h1>
        {#if data.citizen.citizenId}
          <Badge variant="outline" class="font-mono text-xs">{data.citizen.citizenId}</Badge>
        {/if}
      </div>
      <p class="text-muted-foreground text-sm">@{data.citizen.username}</p>
    </div>

    <!-- Meta: location, joined -->
    <div class="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {#if data.citizen.location}
        <span class="flex items-center gap-1">
          <MapPin class="size-3.5" />
          {data.citizen.location}
        </span>
      {/if}
      {#if data.citizen.joinedAt}
        <span class="flex items-center gap-1">
          <Calendar class="size-3.5" />
          Citizen since {formatDate(data.citizen.joinedAt)}
        </span>
      {/if}
    </div>

    <!-- Bio -->
    {#if data.citizen.bio}
      <p class="mb-4 text-sm leading-relaxed">{data.citizen.bio}</p>
    {/if}

    <!-- Links -->
    {#if data.citizen.links.length > 0}
      <div class="mb-4 flex flex-wrap gap-3">
        {#each data.citizen.links as link}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
          >
            <LinkIcon class="size-3.5" />
            {link.label}
          </a>
        {/each}
      </div>
    {/if}

    <Separator class="mb-6" />

    <!-- Tabs: Activity | Proposals -->
    <Tabs.Root value="activity">
      <Tabs.List class="mb-4">
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="proposals">Proposals</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="activity">
        {#if data.activity.length === 0}
          <p class="text-muted-foreground text-sm">No activity yet.</p>
        {:else}
          <ul class="divide-y rounded-md border">
            {#each data.activity as entry}
              <li class="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span class="text-muted-foreground w-36 shrink-0 font-mono text-xs">
                  {formatTimestamp(entry.createdAt)}
                </span>
                <span class="text-sm leading-relaxed">
                  {#each buildLogSentence(entry) as seg}
                    {#if seg.type === 'text'}
                      {seg.value}
                    {:else if seg.type === 'code'}
                      <span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{seg.value}</span>
                    {:else if seg.type === 'link'}
                      <a href={seg.href} class="bg-muted text-primary rounded px-1.5 py-0.5 underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors">{seg.value}</a>
                    {:else if seg.type === 'code-link'}
                      <a href={seg.href} class="bg-muted text-primary rounded px-1.5 py-0.5 font-mono text-xs underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors">{seg.value}</a>
                    {/if}
                  {/each}
                </span>
              </li>
            {/each}
          </ul>
          <p class="text-muted-foreground mt-3 text-xs">
            Showing last {data.activity.length} entries. <a href="/activity?user={data.citizen.id}" class="hover:underline underline-offset-4">View full log →</a>
          </p>
        {/if}
      </Tabs.Content>

      <Tabs.Content value="proposals">
        <p class="text-muted-foreground text-sm">Proposals coming soon.</p>
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>
