<script lang="ts">
  import { goto } from '$app/navigation'
  import * as Card from '$lib/components/ui/card'
  import * as Select from '$lib/components/ui/select'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { ACTION_OPTIONS, buildLogSentence, displayHandle, formatRoles } from '$lib/domain/audit'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let selectedAction = $state('')
  $effect(() => { selectedAction = data.filterAction })

  function filterParams() {
    const params = new URLSearchParams()
    if (selectedAction) params.set('action', selectedAction)
    if (data.filterUser) params.set('user', data.filterUser)
    return params
  }

  function applyFilter() {
    goto(`?${filterParams().toString()}`)
  }

  function clearFilter() {
    selectedAction = ''
    goto('/activity')
  }

  function nextUrl(): string {
    const params = filterParams()
    if (data.nextCursor) params.set('cursor', data.nextCursor)
    return `?${params.toString()}`
  }

  function prevUrl(): string {
    const params = filterParams()
    if (data.prevCursor) params.set('prev', data.prevCursor)
    return `?${params.toString()}`
  }

  function formatTimestamp(d: Date | string): string {
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
</script>

<svelte:head>
  <title>Activity · Gaya OS</title>
</svelte:head>

<div class="mb-8">
  <h1 class="text-3xl font-bold tracking-tight">Activity</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    All actions in the micronation — transparent and publicly visible.
  </p>
</div>

<Card.Root>
  <Card.Header class="pb-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Card.Title class="text-base">
        Activity Log
        {#if data.filterAction || data.filterUser}
          <span class="text-muted-foreground font-normal text-sm ml-1">(filtered)</span>
        {/if}
      </Card.Title>
      <div class="flex items-center gap-2">
        <Select.Root type="single" bind:value={selectedAction} onValueChange={applyFilter}>
          <Select.Trigger class="w-48 h-8 text-sm">
            {ACTION_OPTIONS.find(o => o.value === selectedAction)?.label ?? 'All actions'}
          </Select.Trigger>
          <Select.Content>
            {#each ACTION_OPTIONS as opt}
              <Select.Item value={opt.value}>{opt.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
        {#if data.filterAction || data.filterUser}
          <Button variant="ghost" size="sm" onclick={clearFilter}>Clear</Button>
        {/if}
      </div>
    </div>
  </Card.Header>
  <Separator />

  {#if data.entries.length === 0}
    <Card.Content>
      <p class="text-muted-foreground text-sm py-4">No entries found.</p>
    </Card.Content>
  {:else}
    <ul class="divide-y">
      {#each data.entries as entry}
        <li class="flex flex-col gap-0.5 px-6 py-3 sm:flex-row sm:items-baseline sm:gap-3">
          <!-- Timestamp -->
          <span class="text-muted-foreground w-40 shrink-0 font-mono text-xs">
            {formatTimestamp(entry.createdAt)}
          </span>

          <!-- Log sentence -->
          <span class="text-sm leading-relaxed">
            {#if entry.user}
              <a
                href="?user={entry.user.id}"
                class="font-medium hover:underline underline-offset-4"
              >{displayHandle(entry.user)}</a>
              <span class="text-muted-foreground text-xs"> ({formatRoles(entry.user)})</span>
            {:else}
              <span class="text-muted-foreground">System</span>
            {/if}
            {#each buildLogSentence(entry) as seg}
              {#if seg.type === 'text'}
                {seg.value}
              {:else if seg.type === 'code'}
                <span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{seg.value}</span>
              {:else if seg.type === 'link'}
                <a href={seg.href} class="bg-muted text-primary rounded px-1.5 py-0.5 underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors">{seg.value}</a>
              {:else if seg.type === 'code-link'}
                <a href={seg.href} class="bg-muted text-primary rounded px-1.5 py-0.5 font-mono text-xs underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors">{seg.value}</a>
              {/if}
            {/each}
          </span>
        </li>
      {/each}
    </ul>
  {/if}

  {#if data.prevCursor || data.nextCursor}
    <Separator />
    <Card.Footer class="flex items-center justify-end gap-2 py-3">
      <Button variant="outline" size="sm" href={prevUrl()} disabled={!data.prevCursor}>
        Previous
      </Button>
      <Button variant="outline" size="sm" href={nextUrl()} disabled={!data.nextCursor}>
        Next
      </Button>
    </Card.Footer>
  {/if}
</Card.Root>
