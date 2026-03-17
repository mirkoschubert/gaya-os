<script lang="ts">
  import { page } from '$app/state'
  import { marked } from 'marked'
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { DOCUMENT_TYPE_LABELS } from '$lib/domain/documents'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const renderedHtml = $derived(
    data.document.activeContent ? (marked.parse(data.document.activeContent) as string) : ''
  )

  function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const base = $derived(`/documents/${data.document.slug}`)
  const isHistory = $derived(page.url.pathname.startsWith(`${base}/history`))
  const isDiff = $derived(page.url.pathname.startsWith(`${base}/diff`))
  const isCurrent = $derived(!isHistory && !isDiff)
</script>

<svelte:head>
  <title>{data.document.title} · Gaya OS</title>
</svelte:head>

<div class="mb-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <h1 class="text-3xl font-bold tracking-tight">{data.document.title}</h1>
    <div class="flex items-center gap-2">
      <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[data.document.type]}</Badge>
      {#if data.document.activeVersion}
        <Badge variant="outline" class="font-mono">v{data.document.activeVersion.versionLabel}</Badge>
      {/if}
    </div>
  </div>
</div>

<div class="flex gap-1 mb-6">
  <Button variant={isCurrent ? 'default' : 'ghost'} size="sm" href={base}>Current</Button>
  <Button variant={isHistory ? 'default' : 'ghost'} size="sm" href="{base}/history">History</Button>
  <Button variant={isDiff ? 'default' : 'ghost'} size="sm" href="{base}/diff">Diff</Button>
</div>

<div class="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
  <div class="prose max-w-none">
    {@html renderedHtml}
  </div>

  <aside>
    <Card.Root>
      <Card.Content class="pt-4 flex flex-col gap-3">
        <div>
          <p class="text-xs text-muted-foreground mb-1">Type</p>
          <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[data.document.type]}</Badge>
        </div>
        {#if data.document.activeVersion}
          <div>
            <p class="text-xs text-muted-foreground mb-1">Version</p>
            <Badge variant="outline" class="font-mono">v{data.document.activeVersion.versionLabel}</Badge>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Published</p>
            <p class="text-sm">{formatDate(data.document.activeVersion.createdAt)}</p>
          </div>
          {#if data.document.activeVersion.createdBy}
            <div>
              <p class="text-xs text-muted-foreground mb-1">Author</p>
              <p class="text-sm">
                {data.document.activeVersion.createdBy.username
                  ? `@${data.document.activeVersion.createdBy.username}`
                  : data.document.activeVersion.createdBy.name}
              </p>
            </div>
          {/if}
          {#if data.document.activeVersion.changelog}
            <Separator />
            <div>
              <p class="text-xs text-muted-foreground mb-1">Changelog</p>
              <p class="text-sm">{data.document.activeVersion.changelog}</p>
            </div>
          {/if}
        {/if}
        <Separator />
        <a href="{base}/history" class="text-primary text-sm hover:underline underline-offset-4">
          View version history →
        </a>
      </Card.Content>
    </Card.Root>
  </aside>
</div>
