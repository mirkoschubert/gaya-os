<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion'
  import { Button } from '$lib/components/ui/button'
  import PublicHero from '$lib/components/public/PublicHero.svelte'
</script>

<svelte:head>
  <title>FAQ · Civitas Gaya</title>
</svelte:head>

<!-- ─── HERO ─────────────────────────────────────────────── -->
<PublicHero
  badge="Frequently Asked Questions"
  title="Questions about Civitas Gaya"
  subtitle="Everything you need to know about what we are, how we govern ourselves, and how to get involved."
  image="/images/gaya-faq.webp"
/>

<!-- ─── ABOUT ──────────────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-[1fr_2fr] lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">The Basics</div>
        <h2 class="text-3xl font-bold tracking-tight">About Civitas Gaya</h2>
      </div>
      <Accordion.Root type="multiple" class="w-full">
        <Accordion.Item value="what-is">
          <Accordion.Trigger class="text-left">What is Civitas Gaya?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              Civitas Gaya is a council-democratic micronation in exile, founded by people who share
              the story and values of a community that once lived on the distant planet Gaya in the
              Helion system. It exists today as a voluntary, transnational political project organised
              mainly through digital tools.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="real-or-roleplay">
          <Accordion.Trigger class="text-left">Is Civitas Gaya "real" or just a role-play?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              Civitas Gaya is <strong class="text-foreground font-medium">not</strong> a recognised state under international law
              and does not claim to be one. It is a serious micronation: a community that uses
              state-like structures - constitution, councils, citizenship, symbols - to experiment
              with egalitarian and participatory self-government. How deep you engage (purely
              symbolic, strongly political, artistic) is up to you.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="planet-gaya">
          <Accordion.Trigger class="text-left">What is the connection to the planet Gaya?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              In our founding story, the ancestors of Civitas Gaya were taken from Earth to Gaya,
              built a new society there and eventually returned to Earth in exile. Gaya is defined
              in the Constitution as the original and indivisible territory of Civitas Gaya. Whether
              you see this as literal history, shared myth or a political metaphor, it provides the
              common narrative horizon for our community.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="ideology">
          <Accordion.Trigger class="text-left">Is this a left-wing / right-wing project?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              Civitas Gaya is explicitly egalitarian, anti-elitist and non-capitalist in its
              institutional design, but it does not enforce a single ideological doctrine. Different
              political, philosophical or spiritual viewpoints are welcome as long as they accept the
              constitutional framework, respect pluralism and fundamental rights, and do not seek to
              establish new ruling classes or authoritarian structures.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="funding">
          <Accordion.Trigger class="text-left">How is Civitas Gaya funded?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              At this stage, Civitas Gaya relies on voluntary contributions of time, skills and,
              where necessary, financial or in-kind support from citizens and sympathisers. Any
              future economic activity or funding mechanism must respect constitutional principles:
              transparency, democratic control and a ban on domination through concentrated
              ownership of core infrastructure.
            </p>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  </div>
</section>

<!-- ─── TERRITORY & STATUS ─────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-[1fr_2fr] lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Legal Status</div>
        <h2 class="text-3xl font-bold tracking-tight">Territory & Sovereignty</h2>
      </div>
      <Accordion.Root type="multiple" class="w-full">
        <Accordion.Item value="territory">
          <Accordion.Trigger class="text-left">Do you claim any territory on Earth?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              No. Civitas Gaya does <strong class="text-foreground font-medium">not</strong> claim
              exclusive sovereignty over any piece of land on Earth. All Earth-based states retain
              full legal authority. Our territorial ideas - the home planet Gaya, the Gaya Foundation
              Stone, and "personal ground" under a citizen's feet - are symbolic frameworks for
              identity and internal organisation, not legal claims against existing countries.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="secessionist">
          <Accordion.Trigger class="text-left">Are you a secessionist movement?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              No. Civitas Gaya does not seek secession from any existing state and does not encourage
              citizens to break the law of their country of residence. Participation is compatible
              with any macronational citizenship. We operate within, and with respect for, existing
              legal orders.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="micronations">
          <Accordion.Trigger class="text-left">Can other micronations recognise Civitas Gaya?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              Yes. Civitas Gaya is open to diplomatic relations, mutual recognition and cooperation
              with other micronations. We favour clear, honest communication about the fictional,
              symbolic and practical aspects of each project, respect for each other's internal
              structures, and joint experiments in democratic practice and culture.
            </p>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  </div>
</section>

<!-- ─── GOVERNANCE ─────────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-[1fr_2fr] lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">How It Works</div>
        <h2 class="text-3xl font-bold tracking-tight">Governance & Decisions</h2>
      </div>
      <Accordion.Root type="multiple" class="w-full">
        <Accordion.Item value="in-charge">
          <Accordion.Trigger class="text-left">Who is in charge?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              There is no permanent head of state. Sovereignty lies with the
              <strong class="text-foreground font-medium">citizenry</strong> as a whole. Power is
              exercised through councils and direct democratic processes defined in the Constitution.
              Delegates and office-holders have limited mandates, are accountable to those they
              represent, and can be recalled.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="decisions">
          <Accordion.Trigger class="text-left">How do decisions get made?</Accordion.Trigger>
          <Accordion.Content>
            <div class="text-muted-foreground leading-relaxed space-y-4 pb-2">
              <p>Decisions follow three main steps:</p>
              <div class="space-y-3">
                {#each [
                  { n: '01', label: 'Initiative', body: 'Citizens submit proposals on policy, laws or institutional changes.' },
                  { n: '02', label: 'Deliberation', body: 'Proposals are discussed in open, documented channels; amendments can be suggested.' },
                  { n: '03', label: 'Decision', body: 'Binding votes are held using secure digital tools, respecting one-person-one-vote and defined quorum/majority rules.' },
                ] as step}
                  <div class="flex gap-4">
                    <span class="text-xs font-semibold text-muted-foreground shrink-0 pt-0.5">{step.n}</span>
                    <div>
                      <span class="text-sm font-medium text-foreground">{step.label}</span>
                      <span class="text-sm"> - {step.body}</span>
                    </div>
                  </div>
                {/each}
              </div>
              <p>
                Important structural questions (especially constitutional changes) require higher
                thresholds and longer deliberation.
              </p>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  </div>
</section>

<!-- ─── CITIZENSHIP ───────────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-[1fr_2fr] lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Membership</div>
        <h2 class="text-3xl font-bold tracking-tight">Citizenship</h2>
      </div>
      <Accordion.Root type="multiple" class="w-full">
        <Accordion.Item value="become-citizen">
          <Accordion.Trigger class="text-left">How can I become a citizen?</Accordion.Trigger>
          <Accordion.Content>
            <div class="text-muted-foreground leading-relaxed space-y-4 pb-2">
              <div class="space-y-3">
                {#each [
                  { n: '01', body: 'Register as a visitor on the official platform and get familiar with the Constitution and core values.' },
                  { n: '02', body: 'Submit a short declaration that you endorse the Constitution and wish to join as a citizen.' },
                  { n: '03', body: 'Complete any onboarding or introduction procedure defined by the Citizenship / Naturalisation Law.' },
                  { n: '04', body: 'Receive your Citizen ID once approved by the competent council or committee.' },
                ] as step}
                  <div class="flex gap-4 text-sm">
                    <span class="text-xs font-semibold text-muted-foreground shrink-0 pt-0.5">{step.n}</span>
                    <p>{step.body}</p>
                  </div>
                {/each}
              </div>
              <p>
                Details may evolve as our institutions mature; the core idea is openness plus a
                meaningful commitment.
              </p>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="dual-citizenship">
          <Accordion.Trigger class="text-left">Do I have to give up my other citizenships?</Accordion.Trigger>
          <Accordion.Content>
            <p class="text-muted-foreground leading-relaxed pb-2">
              No. Civitas Gaya explicitly accepts dual and multiple citizenships. Your macronational
              citizenship remains fully in place. Civitas Gaya does not provide passports recognised
              by other states and does not offer consular protection.
            </p>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="rights">
          <Accordion.Trigger class="text-left">What rights do citizens have?</Accordion.Trigger>
          <Accordion.Content>
            <div class="text-muted-foreground leading-relaxed space-y-3 pb-2">
              <p>Citizens have, among others:</p>
              <ul class="space-y-1.5 pl-1">
                {#each [
                  'The right to propose, deliberate and vote on laws and policies',
                  'The right to stand for and hold council roles (with term limits and recall)',
                  'Rights to freedom of expression, association and conscience within the bounds of the Constitution',
                  'The right to fair procedures, including to be heard and to appeal decisions that affect their status or rights',
                ] as right}
                  <li class="flex gap-3 text-sm">
                    <span class="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50"></span>
                    {right}
                  </li>
                {/each}
              </ul>
              <p class="text-sm">All institutions of Civitas Gaya are bound by these rights.</p>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="responsibilities">
          <Accordion.Trigger class="text-left">What are my responsibilities as a citizen?</Accordion.Trigger>
          <Accordion.Content>
            <div class="text-muted-foreground leading-relaxed space-y-3 pb-2">
              <p>Citizens are expected to:</p>
              <ul class="space-y-1.5 pl-1">
                {#each [
                  'Respect the Constitution and the rights of others',
                  'Participate honestly and constructively in deliberation and decision-making',
                  'Resist attempts to capture institutions for personal or factional domination',
                  'Respect the laws of their macronational countries while acting in the name of Civitas Gaya',
                ] as resp}
                  <li class="flex gap-3 text-sm">
                    <span class="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50"></span>
                    {resp}
                  </li>
                {/each}
              </ul>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="get-involved">
          <Accordion.Trigger class="text-left">How can I get involved without becoming a citizen?</Accordion.Trigger>
          <Accordion.Content>
            <div class="text-muted-foreground leading-relaxed space-y-3 pb-2">
              <p>You can:</p>
              <ul class="space-y-1.5 pl-1">
                {#each [
                  'Join as a visitor and follow debates',
                  'Contribute ideas, art, writing or technical skills in open projects',
                  'Collaborate from within another micronation',
                  'Use our materials and concepts as inspiration for your own initiatives, under appropriate attribution',
                ] as opt}
                  <li class="flex gap-3 text-sm">
                    <span class="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50"></span>
                    {opt}
                  </li>
                {/each}
              </ul>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  </div>
</section>

<!-- ─── CTA ───────────────────────────────────────────────── -->
<section
  class="py-24"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="max-w-xl">
      <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Still curious?</div>
      <h2 class="mb-4 text-3xl font-bold tracking-tight">More questions?</h2>
      <p class="mb-8 text-muted-foreground leading-relaxed">
        If your question is not answered here, you are welcome to contact us through the official
        channels of Civitas Gaya. We read everything.
      </p>
      <div class="flex gap-4">
        <Button href="/contact">Contact us</Button>
        <Button variant="outline" href="/auth/register">Join as a Visitor</Button>
      </div>
    </div>
  </div>
</section>
