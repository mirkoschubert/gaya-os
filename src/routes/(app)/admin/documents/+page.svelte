<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import * as Select from '$lib/components/ui/select'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'
  import { DOCUMENT_TYPE_LABELS } from '$lib/domain/documents'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let title = $state('')
  let type = $state('')
  let slug = $state('')
  let slugTouched = $state(false)

  $effect(() => {
    if (title && !slugTouched) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
  })

  function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const availableTypes = $derived(
    Object.entries(DOCUMENT_TYPE_LABELS).filter(
      ([value]) => value !== 'CONSTITUTION' || !data.hasConstitution
    )
  )
</script>

<svelte:head>
  <title>Documents · Admin · Gaya OS</title>
</svelte:head>

<div class="mb-8">
  <h1 class="text-3xl font-bold tracking-tight">Documents</h1>
  <p class="text-muted-foreground mt-1 text-sm">Manage governance documents and versions.</p>
</div>

<div class="grid gap-6 lg:grid-cols-3">
  <div class="lg:col-span-2">
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">All Documents</Card.Title>
      </Card.Header>
      <Separator />
      {#if data.documents.length === 0}
        <Card.Content>
          <p class="text-muted-foreground text-sm py-4">No documents yet. Create one on the right.</p>
        </Card.Content>
      {:else}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Title</Table.Head>
              <Table.Head class="hidden sm:table-cell w-28">Type</Table.Head>
              <Table.Head class="hidden sm:table-cell w-24">Version</Table.Head>
              <Table.Head class="hidden md:table-cell w-32">Updated</Table.Head>
              <Table.Head class="w-20"></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each data.documents as doc}
              <Table.Row>
                <Table.Cell class="font-medium text-sm">
                  {doc.title}
                  <div class="sm:hidden flex flex-wrap gap-1.5 mt-1">
                    <Badge variant="secondary" class="text-xs">
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </Badge>
                    {#if doc.activeVersion}
                      <span class="font-mono text-xs text-muted-foreground">v{doc.activeVersion.versionLabel}</span>
                    {/if}
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden sm:table-cell">
                  <Badge variant="secondary" class="text-xs">
                    {DOCUMENT_TYPE_LABELS[doc.type]}
                  </Badge>
                </Table.Cell>
                <Table.Cell class="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                  {#if doc.activeVersion}v{doc.activeVersion.versionLabel}{:else}—{/if}
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                  {#if doc.activeVersion}{formatDate(doc.activeVersion.createdAt)}{:else}—{/if}
                </Table.Cell>
                <Table.Cell>
                  <Button variant="outline" size="sm" href="/admin/documents/{doc.slug}/versions/new">
                    Manage
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      {/if}
    </Card.Root>
  </div>

  <div>
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">New Document</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content class="pt-4">
        <form method="POST" action="?/createDocument" class="flex flex-col gap-4">
          {#if form?.error}
            <p class="text-destructive text-sm">{form.error}</p>
          {/if}

          <div class="flex flex-col gap-1.5">
            <Label for="title">Title</Label>
            <Input
              id="title"
              name="title"
              bind:value={title}
              placeholder="e.g. Constitution"
              required
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="type">Type</Label>
            <Select.Root type="single" name="type" bind:value={type} required>
              <Select.Trigger id="type">
                {type ? DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS] : 'Select type…'}
              </Select.Trigger>
              <Select.Content>
                {#each availableTypes as [value, label]}
                  <Select.Item {value}>{label}</Select.Item>
                {/each}
                {#if data.hasConstitution}
                  <Select.Item value="CONSTITUTION" disabled>
                    Constitution (already exists)
                  </Select.Item>
                {/if}
              </Select.Content>
            </Select.Root>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              bind:value={slug}
              oninput={() => { slugTouched = true }}
              placeholder="e.g. constitution"
              pattern="[a-z0-9-]+"
              required
            />
            <p class="text-muted-foreground text-xs">URL: /documents/{slug || '…'}</p>
          </div>

          <Button type="submit" size="sm">Create document</Button>
        </form>
      </Card.Content>
    </Card.Root>
  </div>
</div>
