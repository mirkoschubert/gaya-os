<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import PublicHero from '$lib/components/public/PublicHero.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Civitas Gaya</title>
</svelte:head>

<!-- ─── HERO ──────────────────────────────────────────────── -->
<PublicHero
  badge="Council Democracy · Liquid Voting · Open Citizenship"
  title="Welcome to Civitas Gaya"
  subtitle="A micro-nation built on council democracy, liquid voting, and participatory budgeting - where every citizen shapes the nation."
  image="/images/gaya-home.webp"
  primaryAction={data.user
    ? { href: '/dashboard', label: 'Go to Dashboard' }
    : { href: '/auth/register', label: 'Join Civitas Gaya' }}
  secondaryAction={{ href: '/government', label: 'Learn more', variant: 'outline' }}
/>

<!-- ─── STATUS BAR ─────────────────────────────────────────── -->
<section
  class="border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16 py-8">
    <div class="flex flex-wrap gap-12 justify-center text-center">
      <div>
        <a href="/constitution" class="hover:underline underline-offset-4">
          <div class="text-2xl font-bold">{data.constitutionVersion ? `v${data.constitutionVersion}` : '-'}</div>
          <div class="text-xs text-muted-foreground mt-1">Constitution</div>
        </a>
      </div>
      <div>
        <div class="text-2xl font-bold">v{data.appVersion}</div>
        <div class="text-xs text-muted-foreground mt-1">Gaya OS</div>
      </div>
      <div>
        <div class="text-2xl font-bold">{data.stage}</div>
        <div class="text-xs text-muted-foreground mt-1">Stage</div>
      </div>
      <div>
        <div class="text-2xl font-bold">{data.membershipOpen ? 'Open' : 'Closed'}</div>
        <div class="text-xs text-muted-foreground mt-1">Membership</div>
      </div>
      <div>
        <div class="text-2xl font-bold">{data.citizenCount}</div>
        <div class="text-xs text-muted-foreground mt-1">Citizens</div>
      </div>
      <div>
        <div class="text-2xl font-bold">{data.visitorCount}</div>
        <div class="text-xs text-muted-foreground mt-1">Visitors</div>
      </div>
    </div>
  </div>
</section>

<!-- ─── HOW IT WORKS ──────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-2 lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Participation</div>
        <h2 class="mb-6 text-3xl font-bold tracking-tight">How it works</h2>
        <p class="text-muted-foreground leading-relaxed mb-8">
          Civitas Gaya is a real political community - not a game, not a simulation.
          Joining is simple. Participating is meaningful.
        </p>
        {#if data.user}
          <Button href="/dashboard">Go to Dashboard</Button>
        {:else}
          <div class="flex gap-4">
            <Button href="/auth/register">Join as a Visitor</Button>
            <Button variant="outline" href="/government">Learn more</Button>
          </div>
        {/if}
      </div>
      <div class="space-y-0 divide-y divide-border">
        {#each [
          { n: '01', title: 'Register as a Visitor', body: 'Create an account and explore the nation. Read proposals, follow debates, and get a feel for how Civitas Gaya works - without any commitment.' },
          { n: '02', title: 'Apply for Citizenship', body: 'Acknowledge the Constitution and state why you want to become a citizen. Citizenship grants you full political rights - voting, proposing, delegating.' },
          { n: '03', title: 'Shape the Nation', body: 'Submit proposals, vote directly or delegate your vote to someone you trust. Participate in council decisions and the annual citizen budget.' }
        ] as step}
          <div class="flex gap-5 py-5">
            <span class="text-xs font-semibold text-muted-foreground pt-0.5 shrink-0">{step.n}</span>
            <div>
              <div class="text-sm font-medium mb-1">{step.title}</div>
              <div class="text-sm text-muted-foreground">{step.body}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- ─── QUOTE ─────────────────────────────────────────────── -->
<section
  class="py-32 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-3xl px-8 lg:px-16 text-center">
    <p class="text-2xl sm:text-3xl leading-relaxed text-muted-foreground">
      "Power must not stand still - it must flow."
    </p>
    <p class="mt-6 text-sm text-muted-foreground/60">
      From the founding history of Civitas Gaya
    </p>
  </div>
</section>

<!-- ─── CORE FEATURES ─────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Features</div>
    <h2 class="mb-4 text-3xl font-bold tracking-tight">Built for real democracy</h2>
    <p class="mb-12 max-w-2xl text-muted-foreground leading-relaxed">
      Every tool is designed to distribute power, not concentrate it.
    </p>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each [
        {
          title: 'Proposals & Councils',
          body: 'Submit proposals, discuss ideas in open channels, and bring them to a formal vote through elected councils.'
        },
        {
          title: 'Liquid Democracy',
          body: 'Vote directly or delegate your vote to someone you trust - per topic or globally. Change your mind at any time.'
        },
        {
          title: 'Citizen Budget',
          body: 'Participate in allocating the annual budget. Every citizen has an equal say in how shared resources are spent.'
        },
        {
          title: 'Council Oversight',
          body: 'Councils are mandated, recallable and time-limited. Citizens can overrule any council decision by proposal.'
        },
        {
          title: 'Public Record',
          body: 'Every decision, vote and governance change is logged transparently and accessible to all citizens and visitors.'
        },
        {
          title: 'Open Citizenship',
          body: 'No barriers based on origin, language or status. Anyone who accepts the Constitution can become a citizen.'
        }
      ] as feature}
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-base">{feature.title}</Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-sm text-muted-foreground">{feature.body}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<!-- ─── PROPOSALS & VOTES PLACEHOLDER ────────────────────── -->
<section
  class="py-24"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-border border-dashed p-10 flex flex-col items-start gap-4">
        <div class="text-xs font-medium uppercase tracking-widest text-muted-foreground">Proposals</div>
        <h3 class="text-xl font-semibold">Active Proposals</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Once proposals are submitted by citizens, the most recent and active ones will appear here.
        </p>
        <Button variant="outline" disabled>Coming soon</Button>
      </div>
      <div class="rounded-2xl border border-border border-dashed p-10 flex flex-col items-start gap-4">
        <div class="text-xs font-medium uppercase tracking-widest text-muted-foreground">Voting</div>
        <h3 class="text-xl font-semibold">Open Votes</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Active vote sessions will be listed here so citizens can participate directly from the home page.
        </p>
        <Button variant="outline" disabled>Coming soon</Button>
      </div>
    </div>
  </div>
</section>
