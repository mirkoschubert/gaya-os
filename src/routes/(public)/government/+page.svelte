<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'
  import { Badge } from '$lib/components/ui/badge'
  import PublicHero from '$lib/components/public/PublicHero.svelte'
</script>

<svelte:head>
  <title>Government · Civitas Gaya</title>
</svelte:head>

<!-- ─── HERO ─────────────────────────────────────────────── -->
<PublicHero
  badge="Council-Democratic Republic in Exile"
  title="Government of Civitas Gaya"
  subtitle="Designed to prevent the concentration of power and to keep political authority directly accountable to those affected by decisions."
  image="/images/gaya-government.webp"
/>

<!-- ─── KEY FACTS ─────────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="max-w-xs mb-12">
      <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Overview</div>
      <h2 class="text-3xl font-bold tracking-tight">Key Facts</h2>
    </div>
    <dl class="grid gap-0 divide-y divide-border">
      {#each [
        { label: 'Form of government', value: 'Council-democratic republic in exile' },
        { label: 'Territorial claim', value: 'Planet Gaya (homeworld in the Helion system), symbolic exile territories on Earth' },
        { label: 'Head of state', value: 'None - sovereignty lies collectively with the citizenry' },
        { label: 'Primary language', value: 'English (working language), with translations encouraged' },
        { label: 'Citizenship', value: 'Voluntary, non-exclusive; dual and multiple macronational citizenships accepted' },
        { label: 'Symbols', value: 'National flag (Helion-Gaya motif); Gaya Foundation Stone as symbolic territorial anchor' },
        { label: 'Digital presence', value: 'Secure online platforms for deliberation, voting and public records' },
      ] as row}
        <div class="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[280px_1fr]">
          <dt class="text-sm font-medium">{row.label}</dt>
          <dd class="text-sm text-muted-foreground">{row.value}</dd>
        </div>
      {/each}
    </dl>
  </div>
</section>

<!-- ─── CONSTITUTIONAL ORDER ──────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-2 lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Foundation</div>
        <h2 class="mb-6 text-3xl font-bold tracking-tight">Constitutional Order</h2>
        <p class="text-muted-foreground leading-relaxed mb-6">
          Civitas Gaya is governed by the <strong class="text-foreground font-medium">Constitution of Civitas Gaya</strong>,
          adopted by its founding citizens in digital assembly. The Constitution is the highest law of the nation -
          all rules, policies and platform norms must conform to it.
        </p>
        <Button variant="outline" href="/constitution">View the Constitution</Button>
      </div>
      <ul class="space-y-5">
        {#each [
          { text: 'Defines Civitas Gaya as a state in exile, whose original and indivisible territory is the planet Gaya.' },
          { text: 'Affirms that all political power derives from the citizenry, exercised through councils and direct democratic processes.' },
          { text: 'Sets binding principles of egalitarianism, anti-elitism, transparency, pluralism and a non-capitalist, participatory economy.' },
          { text: 'Recognises that all institutions must respect fundamental rights and may be recalled or reconfigured by the citizens.' },
        ] as item}
          <li class="flex gap-4 text-sm text-muted-foreground">
            <span class="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/40 translate-y-1.5"></span>
            {item.text}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<!-- ─── INSTITUTIONS ──────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Structure</div>
    <h2 class="mb-4 text-3xl font-bold tracking-tight">Institutions and Councils</h2>
    <p class="mb-12 max-w-2xl text-muted-foreground leading-relaxed">
      Civitas Gaya rejects permanent rulers. Instead, it organises government through councils
      and recallable roles. No single person acts as head of state.
    </p>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each [
        {
          title: 'The Citizenry',
          body: 'Ultimate source of authority. Participates directly in proposals, deliberation and binding votes.',
        },
        {
          title: 'Local & Thematic Councils',
          body: 'Delegates mandated by citizens from specific communities or areas of work. Subject to recall at all times.',
        },
        {
          title: 'Confederal Council',
          body: 'Coordinates constitutional changes, inter-micronational relations and core infrastructure. Operates transparently.',
        },
        {
          title: 'Constitutional Oversight',
          body: 'Reviews laws for compatibility with the Constitution. Can annul acts that violate fundamental rights.',
        },
      ] as inst}
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-base">{inst.title}</Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-sm text-muted-foreground">{inst.body}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<!-- ─── LEGAL FRAMEWORK ───────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-2 lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Norms</div>
        <h2 class="mb-6 text-3xl font-bold tracking-tight">Laws and Legal Framework</h2>
        <p class="text-muted-foreground leading-relaxed">
          All laws must be publicly accessible, adopted through transparent participatory procedures,
          and include clear mechanisms for review, amendment and repeal. Disputes are handled through
          due process, with the right to be heard and to appeal to an independent constitutional instance.
        </p>
      </div>
      <div class="space-y-0 divide-y divide-border">
        {#each [
          { n: '01', title: 'Constitutional norms', body: 'Supreme and directly binding.' },
          { n: '02', title: 'Organic laws', body: 'Higher-order laws defining key structures - Law on Councils, Territorial Law in Exile, Citizenship Law.' },
          { n: '03', title: 'Ordinary laws & regulations', body: 'Detailed rules adopted by councils and confirmed by citizen votes.' },
          { n: '04', title: 'Platform rules & protocols', body: 'Technical and organisational provisions, always subordinate to constitutional rights.' },
        ] as layer}
          <div class="flex gap-5 py-5">
            <span class="text-xs font-semibold text-muted-foreground pt-0.5 shrink-0">{layer.n}</span>
            <div>
              <div class="text-sm font-medium mb-1">{layer.title}</div>
              <div class="text-sm text-muted-foreground">{layer.body}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- ─── CITIZENSHIP ───────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Membership</div>
    <h2 class="mb-4 text-3xl font-bold tracking-tight">Membership and Citizenship</h2>
    <p class="mb-12 max-w-2xl text-muted-foreground leading-relaxed">
      Naturalisation is open but meaningful - a political and ethical commitment within a
      self-governing community, not a replacement for macronational citizenship.
    </p>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr] mb-10">
      <Card.Root>
        <Card.Header>
          <div class="flex items-center justify-between">
            <Card.Title class="text-base">Visitors</Card.Title>
            <Badge variant="secondary">Limited</Badge>
          </div>
        </Card.Header>
        <Card.Content>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex gap-2"><span class="text-foreground">-</span> Register and accept community rules</li>
            <li class="flex gap-2"><span class="text-foreground">-</span> Read, observe, give non-binding feedback</li>
            <li class="flex gap-2"><span class="text-foreground">-</span> No voting rights</li>
          </ul>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <div class="flex items-center justify-between">
            <Card.Title class="text-base">Citizens</Card.Title>
            <Badge>Full rights</Badge>
          </div>
        </Card.Header>
        <Card.Content>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex gap-2"><span class="text-foreground">-</span> Formally endorse the Constitution</li>
            <li class="flex gap-2"><span class="text-foreground">-</span> Complete the naturalisation process</li>
            <li class="flex gap-2"><span class="text-foreground">-</span> Initiative, voting, candidacy, delegation</li>
          </ul>
        </Card.Content>
      </Card.Root>

      <Card.Root class="sm:col-span-2 lg:col-span-1">
        <Card.Header>
          <Card.Title class="text-base">Naturalisation</Card.Title>
        </Card.Header>
        <Card.Content>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex gap-2"><span class="text-foreground">-</span> Statement of commitment to Civitas Gaya's values</li>
            <li class="flex gap-2"><span class="text-foreground">-</span> Introduction to the history of Gaya and the exile</li>
            <li class="flex gap-2"><span class="text-foreground">-</span> Confirmation by citizenship committee</li>
          </ul>
        </Card.Content>
      </Card.Root>
    </div>
    <div class="flex gap-4">
      <Button href="/auth/register">Apply for Citizenship</Button>
      <Button variant="outline" href="/history">Read the History</Button>
    </div>
  </div>
</section>

<!-- ─── EARTH RELATIONS ───────────────────────────────────── -->
<section
  class="py-24"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="max-w-2xl">
      <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Coexistence</div>
      <h2 class="mb-6 text-3xl font-bold tracking-tight">Relationship to Earth-Based States</h2>
      <p class="text-muted-foreground leading-relaxed mb-4">
        As a state in exile, Civitas Gaya does not claim exclusive sovereignty over any physical
        territory on Earth and fully recognises the territorial integrity and legal authority of
        recognised macronational states. Its territorial metaphors - Gaya, the Foundation Stone,
        personal ground - are <strong class="text-foreground font-medium">symbolic and cultural</strong>,
        not competing legal claims.
      </p>
      <p class="text-muted-foreground leading-relaxed">
        Civitas Gaya seeks peaceful coexistence and constructive relations with both micronations
        and macronational entities, based on mutual respect, openness and the shared exploration
        of better forms of democratic life.
      </p>
    </div>
  </div>
</section>
