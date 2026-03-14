<script lang="ts">
  import type { PageData } from './$types'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Dashboard · Gaya OS</title>
</svelte:head>

<div class="mb-8">
  <div class="text-sm text-muted-foreground mb-1">Welcome back</div>
  <h1 class="text-3xl font-bold tracking-tight">{data.user?.name}</h1>
  <div class="flex items-center gap-2 mt-2">
    <span class="text-xs border rounded-full px-2 py-0.5 text-muted-foreground">
      {data.user?.civicStatus}
    </span>
    {#if data.user?.citizenId}
      <span class="text-xs text-muted-foreground font-mono"
        >{data.user.citizenId}</span
      >
    {/if}
  </div>
</div>

<div class="grid gap-4 sm:grid-cols-2">
  {#if data.user?.civicStatus === 'VISITOR'}
    <Card.Root class="sm:col-span-2 border-dashed">
      <Card.Header>
        <Card.Title class="text-base">Apply for Citizenship</Card.Title>
        <Card.Description>
          Acknowledge the constitution and become a full citizen with voting
          rights.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button size="sm" href="/citizenship">Apply now</Button>
      </Card.Footer>
    </Card.Root>
  {/if}

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Proposals</Card.Title>
      <Card.Description>Active discussions and initiatives</Card.Description>
    </Card.Header>
    <Card.Footer>
      <Button variant="outline" size="sm" href="/proposals"
        >View proposals</Button
      >
    </Card.Footer>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Votes</Card.Title>
      <Card.Description>Open vote sessions</Card.Description>
    </Card.Header>
    <Card.Footer>
      <Button variant="outline" size="sm" href="/votes">View votes</Button>
    </Card.Footer>
  </Card.Root>
</div>
