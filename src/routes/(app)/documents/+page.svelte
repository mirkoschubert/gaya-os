<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
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
</script>

<svelte:head>
  <title>Documents · Gaya OS</title>
</svelte:head>

<div class="mb-8">
  <h1 class="text-3xl font-bold tracking-tight">Documents</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    The founding documents of the micronation — constitution, policies, and procedures.
  </p>
</div>

{#if data.documents.length === 0}
  <p class="text-muted-foreground text-sm">No documents published yet.</p>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.documents as doc}
      <Card.Root class="flex flex-col">
        <Card.Header>
          <div class="flex items-start justify-between gap-2">
            <Card.Title class="text-base leading-snug">{doc.title}</Card.Title>
            <Badge variant="secondary" class="shrink-0 text-xs">
              {DOCUMENT_TYPE_LABELS[doc.type]}
            </Badge>
          </div>
          {#if doc.activeVersion}
            <Card.Description class="text-xs">
              v{doc.activeVersion.versionLabel} · Last updated {formatDate(doc.activeVersion.createdAt)}
            </Card.Description>
          {:else}
            <Card.Description class="text-xs text-muted-foreground">No active version</Card.Description>
          {/if}
        </Card.Header>
        <Card.Footer class="mt-auto pt-0">
          <Button variant="outline" size="sm" href="/documents/{doc.slug}" disabled={!doc.activeVersion}>
            Read document →
          </Button>
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
{/if}
