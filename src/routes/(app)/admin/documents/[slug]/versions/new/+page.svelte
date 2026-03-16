<script lang="ts">
  import { browser } from '$app/environment'
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'
  import {
    DOCUMENT_TYPE_LABELS,
    DOCUMENT_STATUS_LABELS,
    nextVersionLabel,
    type VersionBump
  } from '$lib/domain/documents'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  // --- Version label logic ---
  const hasVersions = $derived(data.versions.length > 0)
  const latestVersion = $derived(data.versions[0] ?? null) // first = most recent (desc order)

  let initialVersionLabel = $state('0.1.0')
  let bump = $state<VersionBump>('minor')

  const computedVersionLabel = $derived(
    hasVersions && latestVersion
      ? nextVersionLabel(latestVersion.versionLabel, bump)
      : initialVersionLabel
  )

  // --- Editor content ---
  let content = $state('')

  $effect(() => {
    if (data.document.activeContent && !content) {
      content = data.document.activeContent
    }
  })

  // --- Delete dialog ---
  let deleteOpen = $state(false)

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
</script>

<svelte:head>
  <title>{data.document.title} · New Version · Admin · Gaya OS</title>
</svelte:head>

<div class="mb-6">
  <div class="flex flex-wrap items-center gap-2 mb-1">
    <a href="/admin/documents" class="text-muted-foreground text-sm hover:underline underline-offset-4">Documents</a>
    <span class="text-muted-foreground text-sm">/</span>
    <span class="text-sm font-medium">{data.document.title}</span>
  </div>
  <div class="flex flex-wrap items-start justify-between gap-3">
    <h1 class="text-3xl font-bold tracking-tight">{data.document.title}</h1>
    <div class="flex items-center gap-2">
      <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[data.document.type]}</Badge>
      {#if data.document.activeVersion}
        <Badge variant="outline">v{data.document.activeVersion.versionLabel} active</Badge>
      {/if}
    </div>
  </div>
</div>

<div class="grid gap-6 lg:grid-cols-3">
  <!-- Editor column -->
  <div class="lg:col-span-2 flex flex-col gap-6">
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">New Version</Card.Title>
        <p class="text-muted-foreground text-sm">Write the document content in Markdown.</p>
      </Card.Header>
      <Separator />
      <Card.Content class="pt-4">
        <form method="POST" action="?/createVersion" class="flex flex-col gap-4">
          {#if form?.error}
            <p class="text-destructive text-sm">{form.error}</p>
          {/if}

          <!-- Version label -->
          <div class="flex flex-col gap-1.5">
            <Label>Version</Label>
            {#if hasVersions}
              <div class="flex flex-wrap gap-2">
                {#each (['patch', 'minor', 'major'] as VersionBump[]) as b}
                  <button
                    type="button"
                    onclick={() => { bump = b }}
                    class="flex-1 rounded-md border px-3 py-2 text-sm transition-colors {bump === b
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-accent'}"
                  >
                    <div class="font-medium capitalize">{b}</div>
                    <div class="text-xs opacity-70 mt-0.5">
                      {nextVersionLabel(latestVersion!.versionLabel, b)}
                    </div>
                  </button>
                {/each}
              </div>
              <p class="text-muted-foreground text-xs">
                New version: <span class="font-mono font-medium">v{computedVersionLabel}</span>
                (previous: v{latestVersion!.versionLabel})
              </p>
            {:else}
              <Input
                name="initialVersion"
                bind:value={initialVersionLabel}
                placeholder="0.1.0"
                pattern="\d+\.\d+\.\d+"
                class="font-mono"
              />
              <p class="text-muted-foreground text-xs">Initial version in MAJOR.MINOR.PATCH format</p>
            {/if}
            <input type="hidden" name="versionLabel" value={computedVersionLabel} />
          </div>

          <!-- CodeMirror editor (loaded client-side only) -->
          <div class="flex flex-col gap-1.5">
            <Label for="content-fallback">Content (Markdown)</Label>
            {#if browser}
              {#await import('svelte-codemirror-editor') then { default: CodeMirror }}
                {#await import('@codemirror/lang-markdown') then { markdown }}
                  {#await import('@uiw/codemirror-theme-tokyo-night') then { tokyoNight }}
                    {#await import('@codemirror/view') then { EditorView }}
                      <div class="rounded-md overflow-hidden [&_.cm-editor]:rounded-md [&_.cm-scroller]:overflow-y-auto codemirror-wrapper">
                        <CodeMirror
                          bind:value={content}
                          lang={markdown()}
                          theme={tokyoNight}
                          extensions={[EditorView.lineWrapping]}
                          styles={{ '&': { height: '450px', fontSize: '13px' } }}
                        />
                      </div>
                    {/await}
                  {/await}
                {/await}
              {/await}
            {:else}
              <textarea
                id="content-fallback"
                bind:value={content}
                class="border-input bg-background flex min-h-112.5 w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2"
                placeholder="# Document title&#10;&#10;Write your content in Markdown…"
              ></textarea>
            {/if}
            <!-- Hidden field carries editor value into form POST -->
            <input type="hidden" name="content" value={content} />
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="changelog">Changelog <span class="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="changelog"
              name="changelog"
              placeholder="Brief description of changes…"
            />
          </div>

          <Button type="submit" size="sm">Save as draft</Button>
        </form>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Sidebar: versions + danger zone -->
  <div class="flex flex-col gap-4">
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">Versions</Card.Title>
      </Card.Header>
      <Separator />
      {#if data.versions.length === 0}
        <Card.Content>
          <p class="text-muted-foreground text-sm py-2">No versions yet.</p>
        </Card.Content>
      {:else}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Label</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head class="w-28">Date</Table.Head>
              <Table.Head class="w-20"></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each data.versions as v}
              <Table.Row>
                <Table.Cell class="font-mono text-sm">v{v.versionLabel}</Table.Cell>
                <Table.Cell>
                  <Badge variant={statusVariant(v.status)} class="text-xs">
                    {DOCUMENT_STATUS_LABELS[v.status]}
                  </Badge>
                </Table.Cell>
                <Table.Cell class="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(v.createdAt)}
                </Table.Cell>
                <Table.Cell>
                  {#if v.status === 'DRAFT'}
                    <form method="POST" action="?/publishVersion">
                      <input type="hidden" name="versionId" value={v.id} />
                      <Button type="submit" size="sm" class="text-xs h-7">Publish</Button>
                    </form>
                  {:else}
                    <a
                      href="/documents/{data.document.slug}/versions/{v.versionLabel}"
                      class="text-primary text-xs hover:underline underline-offset-4"
                    >
                      View
                    </a>
                  {/if}
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      {/if}
    </Card.Root>

    <!-- Danger zone -->
    <Card.Root class="border-destructive/50">
      <Card.Header class="pb-3">
        <Card.Title class="text-base text-destructive">Danger Zone</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content class="pt-4">
        <p class="text-muted-foreground text-xs mb-3">
          Permanently delete this document and all its versions. This cannot be undone.
        </p>
        <Dialog.Root bind:open={deleteOpen}>
          <Dialog.Trigger>
            {#snippet child({ props })}
              <Button variant="destructive" size="sm" {...props}>Delete document</Button>
            {/snippet}
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete "{data.document.title}"?</Dialog.Title>
              <Dialog.Description>
                This will permanently delete the document and all {data.versions.length} version{data.versions.length !== 1 ? 's' : ''}. This action cannot be undone.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant="outline" onclick={() => { deleteOpen = false }}>Cancel</Button>
              <form method="POST" action="?/deleteDocument">
                <Button type="submit" variant="destructive">Delete permanently</Button>
              </form>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </Card.Content>
    </Card.Root>
  </div>
</div>

<style>
  :global(.codemirror-wrapper .cm-scroller) {
    scrollbar-width: thin;
    scrollbar-color: #525252 transparent;
  }
  :global(.codemirror-wrapper .cm-scroller::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }
  :global(.codemirror-wrapper .cm-scroller::-webkit-scrollbar-thumb) {
    background: #525252;
    border-radius: 3px;
  }
  :global(.codemirror-wrapper .cm-scroller::-webkit-scrollbar-track) {
    background: transparent;
  }
</style>
