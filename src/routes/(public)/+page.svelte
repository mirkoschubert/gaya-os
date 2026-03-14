<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Gaya OS</title>
</svelte:head>

<!-- Hero -->
<section class="py-20 text-center">
  <div
    class="mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground"
  >
    Experimental · Democratic · Open
  </div>
  <h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
    Welcome to <span class="text-primary">Civitas Gaya</span>
  </h1>
  <p class="mx-auto mb-8 max-w-xl text-muted-foreground">
    A virtual micro-nation and experimental lab for council democracy, liquid
    voting, and participatory budgeting.
  </p>

  {#if data.user}
    <div class="flex justify-center gap-3">
      <Button href="/dashboard">Go to Dashboard</Button>
      <Button variant="outline" href="/about">Learn more</Button>
    </div>
  {:else}
    <div class="flex justify-center gap-3">
      <Button href="/auth/register">Become a Visitor</Button>
      <Button variant="outline" href="/about">Learn more</Button>
    </div>
  {/if}
</section>

<!-- Feature Cards -->
<section class="grid gap-4 sm:grid-cols-3 py-8">
  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Proposals & Councils</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-sm text-muted-foreground">
        Submit proposals, discuss ideas, and let councils vote on what shapes
        the nation.
      </p>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Liquid Democracy</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-sm text-muted-foreground">
        Vote directly or delegate your vote to someone you trust — per topic or
        globally.
      </p>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Citizen Budget</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-sm text-muted-foreground">
        Participate in allocating the annual budget. Every citizen has a say in
        how resources are spent.
      </p>
    </Card.Content>
  </Card.Root>
</section>

<!-- Status Bar -->
<section class="border-t pt-8 mt-4">
  <div class="flex flex-wrap gap-8 justify-center text-center">
    <div>
      <div class="text-2xl font-bold">v0.1</div>
      <div class="text-xs text-muted-foreground mt-1">Constitution</div>
    </div>
    <div>
      <div class="text-2xl font-bold">MVP</div>
      <div class="text-xs text-muted-foreground mt-1">Stage</div>
    </div>
    <div>
      <div class="text-2xl font-bold">Open</div>
      <div class="text-xs text-muted-foreground mt-1">Membership</div>
    </div>
  </div>
</section>
