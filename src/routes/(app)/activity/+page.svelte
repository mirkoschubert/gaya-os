<script lang="ts">
  import { goto } from '$app/navigation'
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import * as Select from '$lib/components/ui/select'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { ACTION_LABELS, ACTION_OPTIONS, displayHandle, entityLink } from '$lib/domain/audit'
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

  function roleBadgeVariant(role: string): 'destructive' | 'secondary' | 'outline' {
    if (role === 'ADMIN') return 'destructive'
    if (role === 'MODERATOR') return 'secondary'
    return 'outline'
  }

  function civicBadgeVariant(status: string): 'default' | 'outline' {
    return status === 'CITIZEN' ? 'default' : 'outline'
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
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-40">Timestamp</Table.Head>
          <Table.Head class="w-36">User</Table.Head>
          <Table.Head>Action</Table.Head>
          <Table.Head class="w-20"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.entries as entry}
          <Table.Row>
            <Table.Cell class="text-muted-foreground text-sm whitespace-nowrap">
              {formatTimestamp(entry.createdAt)}
            </Table.Cell>
            <Table.Cell>
              {#if entry.user}
                <div class="flex flex-wrap items-center gap-1">
                  <a
                    href="?user={entry.user.id}"
                    class="text-sm font-medium hover:underline underline-offset-4"
                  >
                    {displayHandle(entry.user)}
                  </a>
                  <Badge variant={civicBadgeVariant(entry.user.civicStatus)} class="text-xs px-1.5 py-0">
                    {entry.user.civicStatus}
                  </Badge>
                  {#if entry.user.role !== 'USER'}
                    <Badge variant={roleBadgeVariant(entry.user.role)} class="text-xs px-1.5 py-0">
                      {entry.user.role}
                    </Badge>
                  {/if}
                </div>
              {:else}
                <span class="text-muted-foreground text-sm">System</span>
              {/if}
            </Table.Cell>
            <Table.Cell class="text-sm">
              {ACTION_LABELS[entry.action] ?? entry.action}
            </Table.Cell>
            <Table.Cell>
              {#if entityLink(entry.entityType, entry.entityId)}
                <a
                  href={entityLink(entry.entityType, entry.entityId)}
                  class="text-primary text-sm underline-offset-4 hover:underline"
                >
                  view →
                </a>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
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
