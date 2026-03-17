<script lang="ts">
  import { page } from '$app/state'
  import { diffLines } from 'diff'
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { DOCUMENT_TYPE_LABELS } from '$lib/domain/documents'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const changes = $derived(
    data.fromVersion && data.toVersion
      ? diffLines(data.fromVersion.content, data.toVersion.content)
      : []
  )

  const base = $derived(`/documents/${data.document.slug}`)
  const isHistory = $derived(page.url.pathname.startsWith(`${base}/history`))
  const isDiff = $derived(page.url.pathname.startsWith(`${base}/diff`))
  const isCurrent = $derived(!isHistory && !isDiff)
</script>

<svelte:head>
  <title>{data.document.title} · Diff · Gaya OS</title>
</svelte:head>

<div class="mb-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <h1 class="text-3xl font-bold tracking-tight">{data.document.title}</h1>
    <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[data.document.type]}</Badge>
  </div>
</div>

<div class="flex gap-1 mb-4">
  <Button variant={isCurrent ? 'default' : 'ghost'} size="sm" href={base}>Current</Button>
  <Button variant={isHistory ? 'default' : 'ghost'} size="sm" href="{base}/history">History</Button>
  <Button variant={isDiff ? 'default' : 'ghost'} size="sm" href="{base}/diff">Diff</Button>
</div>

{#if !data.fromVersion || !data.toVersion}
  <Card.Root>
    <Card.Content class="pt-6">
      <p class="text-muted-foreground text-sm">
        Select two versions to compare. Use the History tab and click "Diff ↑" or "vs. active".
      </p>
    </Card.Content>
  </Card.Root>
{:else}
  <Card.Root>
    <Card.Header class="pb-3">
      <div class="flex flex-wrap items-center gap-3">
        <Card.Title class="text-base">
          Comparing
          <Badge variant="outline" class="font-mono ml-1">v{data.fromVersion.versionLabel}</Badge>
          →
          <Badge variant="outline" class="font-mono ml-1">v{data.toVersion.versionLabel}</Badge>
        </Card.Title>
        <div class="ml-auto flex gap-3">
          <a href="{base}/versions/{data.fromVersion.versionLabel}" class="text-primary text-sm hover:underline underline-offset-4">
            View v{data.fromVersion.versionLabel}
          </a>
          <a href="{base}/versions/{data.toVersion.versionLabel}" class="text-primary text-sm hover:underline underline-offset-4">
            View v{data.toVersion.versionLabel}
          </a>
        </div>
      </div>
    </Card.Header>
    <Separator />
    <Card.Content class="pt-4">
      {#if changes.length === 0}
        <p class="text-muted-foreground text-sm">No differences found.</p>
      {:else}
        <pre class="text-xs leading-relaxed font-mono overflow-x-auto rounded-sm">{#each changes as change}<span
            class={change.added
              ? 'block bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
              : change.removed
                ? 'block bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
                : 'block text-muted-foreground'
          }>{change.added ? '+ ' : change.removed ? '- ' : '  '}{change.value}</span>{/each}</pre>
      {/if}
    </Card.Content>
  </Card.Root>
{/if}
