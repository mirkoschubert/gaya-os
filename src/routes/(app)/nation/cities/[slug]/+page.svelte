<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Badge } from '$lib/components/ui/badge'
  import { Separator } from '$lib/components/ui/separator'
  import { Button } from '$lib/components/ui/button'
  import { Calendar, Users, MessageSquare, Pencil } from '@lucide/svelte'
  import { buildLogSentence } from '$lib/domain/audit'
  import { messagesCommand } from '$lib/stores/messages'
  import PostComposer from '$lib/components/app/PostComposer.svelte'
  import PostFeed from '$lib/components/app/PostFeed.svelte'
  import ProfileEditModal from '$lib/components/app/ProfileEditModal.svelte'
  import type { PostEntry } from '$lib/domain/posts'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const city = $derived(data.city)

  let posts = $state<PostEntry[]>([])
  $effect.pre(() => { posts = data.posts })

  async function openCityChannel() {
    if (!data.cityChannelId) {
      // Channel may not exist yet - create it via API
      const res = await fetch(`/api/messages/city/${city.id}`, { method: 'POST' })
      if (!res.ok) return
      const json = await res.json()
      messagesCommand.set({ action: 'open', channelId: json.channelId })
    } else {
      messagesCommand.set({ action: 'open', channelId: data.cityChannelId })
    }
  }

  function onNewPost(post: PostEntry) {
    posts = [post, ...posts]
  }

  let editOpen = $state(false)

  let bannerUrl = $state<string | null>(null)
  let description = $state<string | null>(null)
  $effect.pre(() => {
    bannerUrl = city.banner ?? null
    description = city.description ?? null
  })

  function onCitySaved(updates?: Record<string, unknown>) {
    if (!updates) return
    if ('banner' in updates) bannerUrl = updates.banner as string | null
    if ('description' in updates) description = updates.description as string | null
  }

  function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
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

  function initials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }
</script>

<svelte:head>
  <title>{city.name} · Cities · Gaya OS</title>
</svelte:head>

<div class="-mx-6 -mt-6">
  <!-- Banner -->
  <div
    class="relative aspect-square sm:aspect-21/9 w-full bg-linear-to-br from-primary/20 to-primary/5"
    style={bannerUrl ? `background-image: url('${bannerUrl}'); background-size: cover; background-position: center;` : ''}
  >
    <div class="absolute bottom-3 right-3 flex gap-2">
      {#if data.isMember}
        <Button variant="secondary" size="sm" onclick={openCityChannel}>
          <MessageSquare class="size-3.5" />
          Message
        </Button>
      {/if}
      {#if data.canManage}
        <Button variant="secondary" size="sm" onclick={() => (editOpen = true)}>
          <Pencil class="size-3.5" />
          Edit Profile
        </Button>
      {/if}
    </div>
  </div>

  <div class="px-6">
    <!-- Name + meta -->
    <div class="mt-4 mb-4">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-2xl font-bold leading-tight">{city.name}</h1>
      </div>
      <p class="text-muted-foreground text-sm font-mono">#{city.slug}</p>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      <span class="flex items-center gap-1">
        <Calendar class="size-3.5" />
        Founded {formatDate(city.foundedAt)}
      </span>
      <span class="flex items-center gap-1">
        <Users class="size-3.5" />
        {city.memberCount} {city.memberCount === 1 ? 'member' : 'members'}
      </span>
      {#if city.council}
        <a href="/nation/councils/{city.council.id}/profile" class="hover:underline underline-offset-4">
          {city.council.name}
        </a>
      {/if}
    </div>

    {#if description}
      <p class="mb-4 text-sm leading-relaxed">{description}</p>
    {/if}

    <Separator class="mb-6" />

    <Tabs.Root value="announcements">
      <Tabs.List class="mb-4">
        <Tabs.Trigger value="announcements">Announcements</Tabs.Trigger>
        <Tabs.Trigger value="members">
          Members
          <Badge variant="secondary" class="ml-1.5 text-xs">{city.memberCount}</Badge>
        </Tabs.Trigger>
        <Tabs.Trigger value="proposals">Proposals</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
      </Tabs.List>

      <!-- Announcements tab -->
      <Tabs.Content value="announcements">
        {#if data.canPost}
          <div class="mb-6">
            <PostComposer
              entityType="CITY"
              entityId={city.id}
              entityName={city.name}
              onPost={onNewPost}
            />
          </div>
        {/if}
        <PostFeed
          posts={posts}
          currentUserId={data.user?.id ?? ''}
          canDelete={data.canPost}
        />
      </Tabs.Content>

      <!-- Members tab -->
      <Tabs.Content value="members">
        {#if city.members.length === 0}
          <p class="text-muted-foreground text-sm">No members yet.</p>
        {:else}
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {#each city.members as member}
              <a
                href="/nation/citizens/{member.username}"
                class="flex flex-col items-center gap-2 rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors"
              >
                <Avatar.Root class="size-12">
                  {#if member.avatarUrl}
                    <Avatar.Image src={member.avatarUrl} alt={member.displayName} />
                  {/if}
                  <Avatar.Fallback class="text-sm">{initials(member.displayName)}</Avatar.Fallback>
                </Avatar.Root>
                <div class="min-w-0 w-full">
                  <p class="truncate text-sm font-medium leading-tight">{member.displayName}</p>
                  {#if member.username}
                    <p class="truncate text-xs text-muted-foreground">@{member.username}</p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </Tabs.Content>

      <!-- Proposals tab (placeholder) -->
      <Tabs.Content value="proposals">
        <p class="text-muted-foreground text-sm">No proposals yet.</p>
      </Tabs.Content>

      <!-- Activity tab -->
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
        {/if}
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>

{#if data.canManage}
  <ProfileEditModal
    bind:open={editOpen}
    entityType="city"
    city={{ id: city.id, description, banner: bannerUrl }}
    onClose={() => (editOpen = false)}
    onSaved={onCitySaved}
  />
{/if}
