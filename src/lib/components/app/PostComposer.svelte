<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Textarea } from '$lib/components/ui/textarea'
  import { ImageUp, X, Loader2 } from '@lucide/svelte'
  import type { PostEntityType, PostEntry } from '$lib/domain/posts'

  interface Props {
    entityType: PostEntityType
    entityId: string
    entityName?: string
    onPost?: (post: PostEntry) => void
  }

  let { entityType, entityId, entityName, onPost }: Props = $props()

  let body = $state('')
  let mediaUrls = $state<string[]>([])
  let uploading = $state(false)
  let submitting = $state(false)
  let error = $state('')
  let fileInput: HTMLInputElement | undefined = $state()

  async function uploadFile(file: File) {
    uploading = true
    error = ''
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/post-media', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Upload failed')
      }
      const data = await res.json()
      mediaUrls = [...mediaUrls, data.url]
    } catch (e) {
      error = e instanceof Error ? e.message : 'Upload failed'
    } finally {
      uploading = false
    }
  }

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) uploadFile(file)
    input.value = ''
  }

  function removeMedia(url: string) {
    mediaUrls = mediaUrls.filter((u) => u !== url)
  }

  function isVideo(url: string) {
    return url.match(/\.(mp4|webm)(\?|$)/i) !== null
  }

  async function submit() {
    if (!body.trim()) return
    submitting = true
    error = ''
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          postBody: body.trim(),
          mediaUrls,
          entityName
        })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Failed to post')
      }
      const post = await res.json()
      body = ''
      mediaUrls = []
      onPost?.(post)
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to post'
    } finally {
      submitting = false
    }
  }
</script>

<div class="flex flex-col gap-3 rounded-lg border bg-card p-4">
  <Textarea
    bind:value={body}
    placeholder="Write an announcement..."
    rows={4}
    class="resize-none"
  />

  {#if mediaUrls.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each mediaUrls as url (url)}
        <div class="relative">
          {#if isVideo(url)}
            <video src={url} class="h-20 w-20 rounded object-cover" muted></video>
          {:else}
            <img src={url} alt="" class="h-20 w-20 rounded object-cover" />
          {/if}
          <button
            type="button"
            onclick={() => removeMedia(url)}
            class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            aria-label="Remove media"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
      {/each}
    </div>
  {/if}

  {#if error}
    <p class="text-sm text-destructive">{error}</p>
  {/if}

  <div class="flex items-center justify-between gap-2">
    <div>
      <input
        bind:this={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        onchange={onFileChange}
        class="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onclick={() => fileInput?.click()}
        disabled={uploading}
      >
        {#if uploading}
          <Loader2 class="mr-1.5 h-4 w-4 animate-spin" />
          Uploading...
        {:else}
          <ImageUp class="mr-1.5 h-4 w-4" />
          Add media
        {/if}
      </Button>
    </div>
    <Button
      type="button"
      size="sm"
      onclick={submit}
      disabled={submitting || !body.trim()}
    >
      {#if submitting}
        <Loader2 class="mr-1.5 h-4 w-4 animate-spin" />
        Posting...
      {:else}
        Post
      {/if}
    </Button>
  </div>
</div>
