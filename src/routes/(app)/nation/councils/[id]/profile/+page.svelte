<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { page } from '$app/state'
  import { MessageSquare, Pencil } from '@lucide/svelte'
  import { messagesCommand } from '$lib/stores/messages'
  import PostComposer from '$lib/components/app/PostComposer.svelte'
  import PostFeed from '$lib/components/app/PostFeed.svelte'
  import ProfileEditModal from '$lib/components/app/ProfileEditModal.svelte'
  import type { PostEntry } from '$lib/domain/posts'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const council = $derived(data.council)
  const councilMemberships = $derived(
    (page.data as { councilMemberships?: { councilId: string }[] }).councilMemberships ?? []
  )
  const isOwnCouncil = $derived(councilMemberships.some((m) => m.councilId === council.id))

  const typeLabels: Record<string, string> = {
    NATIONAL: 'National Council',
    REGIONAL: 'Regional Council',
    THEMATIC: 'Thematic Council'
  }

  let posts = $state<PostEntry[]>([])
  $effect.pre(() => { posts = data.posts })

  function onNewPost(post: PostEntry) {
    posts = [post, ...posts]
  }

  let editOpen = $state(false)

  let bannerUrl = $state<string | null>(null)
  let scopeDescription = $state<string | null>(null)
  $effect.pre(() => {
    bannerUrl = council.banner ?? null
    scopeDescription = council.scopeDescription ?? null
  })

  function onCouncilSaved(updates?: Record<string, unknown>) {
    if (!updates) return
    if ('banner' in updates) bannerUrl = updates.banner as string | null
    if ('scopeDescription' in updates) scopeDescription = updates.scopeDescription as string | null
  }

  async function openCouncilChat() {
    const res = await fetch(`/api/messages/council/${council.id}`, { method: 'POST' })
    if (res.ok) {
      const { channelId } = await res.json()
      messagesCommand.set({ action: 'open', channelId })
    }
  }
</script>

<svelte:head>
  <title>{council.name} · Gaya OS</title>
</svelte:head>

<div class="-mx-6 -mt-6">
  <!-- Banner -->
  <div
    class="relative aspect-square sm:aspect-21/9 w-full bg-linear-to-br from-primary/20 to-primary/5"
    style={bannerUrl ? `background-image: url('${bannerUrl}'); background-size: cover; background-position: center;` : ''}
  >
    <div class="absolute bottom-3 right-3 flex gap-2">
      {#if !isOwnCouncil}
        <Button variant="secondary" size="sm" onclick={openCouncilChat}>
          <MessageSquare class="size-3.5" />
          Message
        </Button>
      {/if}
      {#if isOwnCouncil}
        <Button variant="secondary" size="sm" onclick={() => (editOpen = true)}>
          <Pencil class="size-3.5" />
          Edit Profile
        </Button>
      {/if}
    </div>
  </div>

  <div class="px-6 mt-4 space-y-6">
  <!-- Header -->
  <div>
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-bold leading-tight">{council.name}</h1>
      <Badge variant="outline">{typeLabels[council.type] ?? council.type}</Badge>
    </div>
    <p class="text-sm text-muted-foreground">{council.unitName}</p>
    {#if scopeDescription}
      <p class="mt-2 text-sm leading-relaxed">{scopeDescription}</p>
    {/if}
  </div>

  <Separator />

  <Tabs.Root value="announcements">
    <Tabs.List class="mb-4">
      <Tabs.Trigger value="announcements">Announcements</Tabs.Trigger>
      <Tabs.Trigger value="members">
        Members
        <Badge variant="secondary" class="ml-1.5 text-xs">{council.members.length}</Badge>
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="announcements">
      {#if data.canPost}
        <div class="mb-6">
          <PostComposer
            entityType="COUNCIL"
            entityId={council.id}
            entityName={council.name}
            onPost={onNewPost}
          />
        </div>
      {/if}
      <PostFeed
        posts={posts}
        currentUserId={(page.data as { user?: { id: string } }).user?.id ?? ''}
        canDelete={data.canPost}
      />
    </Tabs.Content>

    <Tabs.Content value="members">
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
    </Tabs.Content>
  </Tabs.Root>
  </div>
</div>

{#if isOwnCouncil}
  <ProfileEditModal
    bind:open={editOpen}
    entityType="council"
    council={{ id: council.id, scopeDescription, banner: bannerUrl }}
    onClose={() => (editOpen = false)}
    onSaved={onCouncilSaved}
  />
{/if}
