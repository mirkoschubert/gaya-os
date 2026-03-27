<script lang="ts">
  import { useSession } from '$lib/auth-client'
  import { page } from '$app/state'
  import type { AppUser } from '$lib/domain/auth'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { MapPin, Link as LinkIcon, Calendar, Pencil, MessageSquare } from '@lucide/svelte'
  import SocialIcon from '$lib/components/app/SocialIcon.svelte'
  import { countries } from 'countries-list'
  import { LINK_TYPES, getLinkHref } from '$lib/domain/auth'
  import { buildLogSentence, formatRoles } from '$lib/domain/audit'
  import { messagesCommand } from '$lib/stores/messages'
  import PostComposer from '$lib/components/app/PostComposer.svelte'
  import PostFeed from '$lib/components/app/PostFeed.svelte'
  import ProfileEditModal from '$lib/components/app/ProfileEditModal.svelte'
  import type { PostEntry } from '$lib/domain/posts'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const session = useSession()
  const currentUser = $derived($session.data?.user as AppUser | undefined)
  const isOwnProfile = $derived(currentUser?.id === data.citizen.id)
  const caps = $derived((page.data as { caps?: Record<string, boolean> }).caps ?? {})
  const canEditOwnProfile = $derived(caps['can_edit_own_profile'] ?? false)
  const canStartDM = $derived(caps['can_start_dm'] ?? false)

  let posts = $state<PostEntry[]>([])
  $effect.pre(() => { posts = data.posts })

  function onNewPost(post: PostEntry) {
    posts = [post, ...posts]
  }

  let editOpen = $state(false)

  let heroUrl = $state<string | null>(null)
  let avatarUrl = $state<string | null>(null)
  let bio = $state<string | null>(null)
  let locationCity = $state<string | null>(null)
  let locationCountry = $state<string | null>(null)
  let links = $state<typeof data.citizen.links>([])
  let showRealName = $state(true)

  $effect.pre(() => {
    heroUrl = data.citizen.heroUrl ?? null
    avatarUrl = data.citizen.avatarUrl ?? null
    bio = data.citizen.bio ?? null
    locationCity = data.citizen.locationCity ?? null
    locationCountry = data.citizen.locationCountry ?? null
    links = data.citizen.links
    showRealName = data.citizen.showRealName
  })

  function onProfileSaved(updates?: Record<string, unknown>) {
    if (!updates) return
    if ('heroUrl' in updates) heroUrl = updates.heroUrl as string | null
    if ('avatarUrl' in updates) avatarUrl = updates.avatarUrl as string | null
    if ('bio' in updates) bio = updates.bio as string | null
    if ('locationCity' in updates) locationCity = updates.locationCity as string | null
    if ('locationCountry' in updates) locationCountry = updates.locationCountry as string | null
    if ('links' in updates) links = updates.links as typeof data.citizen.links
    if ('showRealName' in updates) showRealName = updates.showRealName as boolean
  }

  async function openDM() {
    const res = await fetch('/api/messages/dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: data.citizen.id })
    })
    if (res.ok) {
      const { channelId } = await res.json()
      messagesCommand.set({ action: 'open', channelId })
    }
  }

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
    class="relative aspect-square sm:aspect-21/9 w-full bg-linear-to-br from-primary/20 to-primary/5"
    style={heroUrl ? `background-image: url('${heroUrl}'); background-size: cover; background-position: center;` : ''}
  >
    <div class="absolute bottom-3 right-3 flex gap-2">
      {#if !isOwnProfile && canStartDM}
        <Button variant="secondary" size="sm" onclick={openDM}>
          <MessageSquare class="size-3.5" />
          Message
        </Button>
      {/if}
      {#if isOwnProfile && canEditOwnProfile}
        <Button variant="secondary" size="sm" onclick={() => (editOpen = true)}>
          <Pencil class="size-3.5" />
          Edit Profile
        </Button>
      {/if}
    </div>
  </div>

  <!-- Avatar + Identity row -->
  <div class="px-6">
    <div class="-mt-12 mb-4 inline-block">
      <Avatar.Root class="size-24 border-4 border-background shadow-md">
        {#if avatarUrl}
          <Avatar.Image src={avatarUrl} alt={data.citizen.displayName} />
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

    <!-- Meta: city, location, joined -->
    <div class="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {#if locationCity || locationCountry}
        <span class="flex items-center gap-1">
          <MapPin class="size-3.5" />
          {[locationCity, locationCountry ? (countries[locationCountry as keyof typeof countries]?.name ?? locationCountry) : null].filter(Boolean).join(', ')}
        </span>
      {:else if data.citizen.location}
        <span class="flex items-center gap-1">
          <MapPin class="size-3.5" />
          {data.citizen.location}
        </span>
      {/if}
      {#if data.citizen.cityName}
        <span class="flex items-center gap-1">
          <MapPin class="size-3.5" />
          {data.citizen.cityName}
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
    {#if bio}
      <p class="mb-4 text-sm leading-relaxed">{bio}</p>
    {/if}

    <!-- Links -->
    {#if links.length > 0}
      <div class="mb-4 flex flex-wrap gap-3">
        {#each links as link}
          {@const def = LINK_TYPES.find((t) => t.value === link.label)}
          {@const href = def ? getLinkHref(link.label, link.url) : link.url}
          {@const label = def?.label ?? link.label}
          {@const iconName = def?.iconKey ?? 'xbrowser'}
          {#if href}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4"
            >
              <SocialIcon icon={iconName} width="14" height="14" />
              {label}
            </a>
          {:else}
            <span class="flex items-center gap-1.5 text-sm text-muted-foreground" title={link.url}>
              <SocialIcon icon={iconName} width="14" height="14" />
              {label}: {link.url}
            </span>
          {/if}
        {/each}
      </div>
    {/if}

    <Separator class="mb-6" />

    <!-- Tabs: Feed | Activity | Proposals -->
    <Tabs.Root value="feed">
      <Tabs.List class="mb-4">
        <Tabs.Trigger value="feed">Feed</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="proposals">Proposals</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="feed">
        {#if data.canPost}
          <div class="mb-6">
            <PostComposer
              entityType="USER"
              entityId={data.citizen.id}
              entityName={data.citizen.displayName}
              onPost={onNewPost}
            />
          </div>
        {/if}
        <PostFeed
          posts={posts}
          currentUserId={currentUser?.id ?? ''}
          canDelete={isOwnProfile}
        />
      </Tabs.Content>

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

{#if isOwnProfile && canEditOwnProfile}
  <ProfileEditModal
    bind:open={editOpen}
    entityType="citizen"
    citizen={{
      id: data.citizen.id,
      bio,
      locationCity,
      locationCountry,
      links,
      showRealName,
      avatarUrl,
      heroUrl
    }}
    onClose={() => (editOpen = false)}
    onSaved={onProfileSaved}
  />
{/if}
