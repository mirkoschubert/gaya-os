<script lang="ts">
  import { marked } from 'marked'
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const renderedHtml = $derived(marked.parse(data.version.content) as string)

  function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
    if (status === 'ACTIVE') return 'default'
    if (status === 'DRAFT') return 'secondary'
    return 'outline'
  }

  const base = $derived(`/documents/${data.version.documentSlug}`)
</script>

<svelte:head>
  <title>{data.version.documentTitle} v{data.version.versionLabel} · Gaya OS</title>
</svelte:head>

<div class="mb-6">
  <div class="flex flex-wrap items-center gap-2 mb-1">
    <a href="/documents" class="text-muted-foreground text-sm hover:underline underline-offset-4">Documents</a>
    <span class="text-muted-foreground text-sm">/</span>
    <a href={base} class="text-muted-foreground text-sm hover:underline underline-offset-4">{data.version.documentTitle}</a>
    <span class="text-muted-foreground text-sm">/</span>
    <a href="{base}/history" class="text-muted-foreground text-sm hover:underline underline-offset-4">History</a>
    <span class="text-muted-foreground text-sm">/</span>
    <span class="text-sm font-medium">v{data.version.versionLabel}</span>
  </div>
  <div class="flex flex-wrap items-start justify-between gap-3">
    <h1 class="text-3xl font-bold tracking-tight">{data.version.documentTitle}</h1>
    <div class="flex items-center gap-2">
      <Badge variant={statusVariant(data.version.status)}>{data.version.status}</Badge>
      <Badge variant="outline" class="font-mono">v{data.version.versionLabel}</Badge>
    </div>
  </div>
  <p class="text-muted-foreground text-sm mt-1">
    {formatDate(data.version.createdAt)}
    {#if data.version.createdBy}
      · by {data.version.createdBy.username
        ? `@${data.version.createdBy.username}`
        : data.version.createdBy.name}
    {/if}
  </p>
</div>

{#if data.version.status !== 'ACTIVE'}
  <div class="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
    This is version {data.version.versionLabel} ({data.version.status.toLowerCase()}) —
    <a href={base} class="font-medium underline underline-offset-4">view the current active version</a>
  </div>
{/if}

<div class="flex gap-2 mb-6">
  <Button variant="outline" size="sm" href="{base}/history">← History</Button>
  {#if data.version.prevVersionLabel}
    <Button variant="outline" size="sm" href="{base}/diff?from={data.version.prevVersionLabel}&to={data.version.versionLabel}">
      Diff vs. previous
    </Button>
  {/if}
</div>

<div class="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
  <div class="prose max-w-none">
    {@html renderedHtml}
  </div>

  <aside>
    <Card.Root>
      <Card.Content class="pt-4 flex flex-col gap-3">
        <div>
          <p class="text-xs text-muted-foreground mb-1">Version</p>
          <Badge variant="outline" class="font-mono">v{data.version.versionLabel}</Badge>
        </div>
        <div>
          <p class="text-xs text-muted-foreground mb-1">Status</p>
          <Badge variant={statusVariant(data.version.status)}>{data.version.status}</Badge>
        </div>
        <div>
          <p class="text-xs text-muted-foreground mb-1">Published</p>
          <p class="text-sm">{formatDate(data.version.createdAt)}</p>
        </div>
        {#if data.version.createdBy}
          <div>
            <p class="text-xs text-muted-foreground mb-1">Author</p>
            <p class="text-sm">{data.version.createdBy.username ? `@${data.version.createdBy.username}` : data.version.createdBy.name}</p>
          </div>
        {/if}
        {#if data.version.changelog}
          <Separator />
          <div>
            <p class="text-xs text-muted-foreground mb-1">Changelog</p>
            <p class="text-sm">{data.version.changelog}</p>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </aside>
</div>
