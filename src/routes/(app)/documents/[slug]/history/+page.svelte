<script lang="ts">
  import { page } from '$app/state'
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { DOCUMENT_TYPE_LABELS } from '$lib/domain/documents'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

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

  const base = $derived(`/documents/${data.document.slug}`)
  const isHistory = $derived(page.url.pathname.startsWith(`${base}/history`))
  const isDiff = $derived(page.url.pathname.startsWith(`${base}/diff`))
  const isCurrent = $derived(!isHistory && !isDiff)

  const activeVersion = $derived(data.versions.find((v) => v.status === 'ACTIVE'))
</script>

<svelte:head>
  <title>{data.document.title} · History · Gaya OS</title>
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

<Card.Root>
  <Card.Header class="pb-3">
    <Card.Title class="text-base">Version History</Card.Title>
  </Card.Header>
  <Separator />
  {#if data.versions.length === 0}
    <Card.Content>
      <p class="text-muted-foreground text-sm py-4">No versions yet.</p>
    </Card.Content>
  {:else}
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-24">Version</Table.Head>
          <Table.Head class="w-24">Status</Table.Head>
          <Table.Head class="w-32">Date</Table.Head>
          <Table.Head class="w-32">Author</Table.Head>
          <Table.Head>Changelog</Table.Head>
          <Table.Head class="w-44"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.versions as v}
          <Table.Row>
            <Table.Cell class="font-mono text-sm">v{v.versionLabel}</Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant(v.status)} class="text-xs">{v.status}</Badge>
            </Table.Cell>
            <Table.Cell class="text-muted-foreground text-sm whitespace-nowrap">
              {formatDate(v.createdAt)}
            </Table.Cell>
            <Table.Cell class="text-sm">
              {#if v.createdBy}
                {v.createdBy.username ? `@${v.createdBy.username}` : v.createdBy.name}
              {:else}
                <span class="text-muted-foreground">—</span>
              {/if}
            </Table.Cell>
            <Table.Cell class="text-sm text-muted-foreground">{v.changelog ?? '—'}</Table.Cell>
            <Table.Cell>
              <div class="flex items-center gap-2">
                <a href="{base}/versions/{v.versionLabel}" class="text-primary text-sm hover:underline underline-offset-4">View</a>
                {#if v.prevVersionLabel}
                  <a
                    href="{base}/diff?from={v.prevVersionLabel}&to={v.versionLabel}"
                    class="text-primary text-sm hover:underline underline-offset-4"
                  >Diff ↑</a>
                {/if}
                {#if activeVersion && v.status !== 'ACTIVE'}
                  <a
                    href="{base}/diff?from={v.versionLabel}&to={activeVersion.versionLabel}"
                    class="text-primary text-sm hover:underline underline-offset-4"
                  >vs. active</a>
                {/if}
              </div>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  {/if}
</Card.Root>
