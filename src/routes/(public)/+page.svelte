<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let bgOffset = $state(0)

  $effect(() => {
    function handleScroll() {
      bgOffset = window.scrollY * 0.4
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })
</script>

<svelte:head>
  <title>Gaya OS</title>
</svelte:head>

<!-- Hero -->
<section
  class="relative overflow-hidden"
  style="height: 100dvh; margin-left: calc(50% - 50vw); width: 100vw;"
>
  <!-- Parallax-Hintergrund -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style="background-image: url('/images/gaya-orbit.webp'); transform: translateY({bgOffset}px); will-change: transform; top: -20%; height: 140%;"
  ></div>

  <!-- Dunkles Overlay -->
  <div class="absolute inset-0 bg-black/60"></div>

  <!-- Inhalt -->
  <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
    <div
      class="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
    >
      Council Democracy · Liquid Voting · Open Citizenship
    </div>
    <h1 class="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
      Welcome to <span class="text-white/90">Civitas Gaya</span>
    </h1>
    <p class="mx-auto mb-8 max-w-xl text-white/70">
      A micro-nation built on council democracy, liquid voting, and participatory
      budgeting — where every citizen shapes the nation.
    </p>

    {#if data.user}
      <div class="flex justify-center gap-3">
        <Button href="/dashboard">Go to Dashboard</Button>
        <Button variant="outline" class="border-white/30 text-white hover:bg-white/10" href="/about">
          Learn more
        </Button>
      </div>
    {:else}
      <div class="flex justify-center gap-3">
        <Button href="/auth/register">Join Civitas Gaya</Button>
        <Button variant="outline" class="border-white/30 text-white hover:bg-white/10" href="/about">
          Learn more
        </Button>
      </div>
    {/if}
  </div>
</section>

<!-- Feature Cards -->
<section class="grid gap-4 sm:grid-cols-3 pt-12 pb-8">
  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Proposals & Councils</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-sm text-muted-foreground">
        Submit proposals, discuss ideas, and bring them to a formal vote through
        elected councils.
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
<section class="border-t pt-8 mt-4 pb-10">
  <div class="flex flex-wrap gap-8 justify-center text-center">
    <div>
      <a href="/constitution" class="hover:underline underline-offset-4">
        <div class="text-2xl font-bold">{data.constitutionVersion ? `v${data.constitutionVersion}` : '—'}</div>
        <div class="text-xs text-muted-foreground mt-1">Constitution</div>
      </a>
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
