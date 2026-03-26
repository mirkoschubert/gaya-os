<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Trash2 } from '@lucide/svelte'
  import { parse } from 'marked'
  import DOMPurify from 'dompurify'
  import type { PostEntry } from '$lib/domain/posts'

  interface Props {
    posts: PostEntry[]
    currentUserId: string
    canDelete?: boolean
  }

  let { posts: initialPosts, currentUserId, canDelete = false }: Props = $props()

  let posts = $state<PostEntry[]>([])
  $effect.pre(() => { posts = [...initialPosts] })

  function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  function renderMarkdown(body: string): string {
    const raw = parse(body) as string
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(raw)
    }
    return raw
  }

  function isVideo(url: string) {
    return url.match(/\.(mp4|webm)(\?|$)/i) !== null
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  async function deletePost(postId: string) {
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    if (res.ok) {
      posts = posts.filter((p) => p.id !== postId)
    }
  }
</script>

{#if posts.length === 0}
  <p class="text-muted-foreground text-sm">No announcements yet.</p>
{:else}
  <div class="flex flex-col gap-6">
    {#each posts as post (post.id)}
      <div class="flex gap-3">
        <Avatar.Root class="size-9 shrink-0">
          <Avatar.Image src={post.authorAvatarUrl ?? ''} alt={post.authorName} />
          <Avatar.Fallback>{getInitials(post.authorName)}</Avatar.Fallback>
        </Avatar.Root>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium">{post.authorName}</span>
              {#if post.authorUsername}
                <span class="text-muted-foreground">@{post.authorUsername}</span>
              {/if}
              <span class="text-muted-foreground">{formatDate(post.createdAt)}</span>
            </div>
            {#if canDelete || post.authorId === currentUserId}
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onclick={() => deletePost(post.id)}
                aria-label="Delete post"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            {/if}
          </div>

          <div class="prose prose-sm dark:prose-invert mt-1 max-w-none">
            {@html renderMarkdown(post.body)}
          </div>

          {#if post.mediaUrls.length > 0}
            <div class="mt-3 flex flex-wrap gap-2">
              {#each post.mediaUrls as url (url)}
                {#if isVideo(url)}
                  <!-- svelte-ignore a11y_media_has_caption -->
                  <video
                    src={url}
                    controls
                    class="max-h-64 max-w-full rounded-lg object-contain"
                  ></video>
                {:else}
                  <img
                    src={url}
                    alt=""
                    class="max-h-64 max-w-full rounded-lg object-contain"
                  />
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
