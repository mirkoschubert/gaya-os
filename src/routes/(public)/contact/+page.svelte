<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import * as Select from '$lib/components/ui/select'
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()

  let bgOffset = $state(0)

  $effect(() => {
    function handleScroll() {
      bgOffset = window.scrollY * 0.4
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })

  const contacts = [
    {
      slug: 'government',
      title: 'Government & General Inquiries',
      email: 'govern@civitasgaya.org',
      description: 'For general questions about the government, institutions, councils or overall direction of Civitas Gaya.',
      uses: [
        'Questions about our political structure',
        'Requests for participation in assemblies or councils',
        'Proposals and suggestions not tied to a specific department',
      ],
    },
    {
      slug: 'legal',
      title: 'Legal & Constitutional Matters',
      email: 'legal@civitasgaya.org',
      description: 'For issues related to the Constitution, laws, rights and procedures.',
      uses: [
        'Questions about constitutional interpretation',
        'Procedural and due-process concerns',
        'Reports of potential rights violations within Civitas Gaya',
      ],
    },
    {
      slug: 'immigration',
      title: 'Immigration & Citizenship',
      email: 'immigration@civitasgaya.org',
      description: 'For all topics concerning membership, naturalisation and citizenship status.',
      uses: [
        'Questions about how to become a visitor or citizen',
        'Problems with registration or Citizen IDs',
        'Updates to your personal data or citizenship status',
      ],
    },
    {
      slug: 'press',
      title: 'Press & Media',
      email: 'press@civitasgaya.org',
      description: 'For journalists, researchers, content creators and media outlets.',
      uses: [
        'Interview requests',
        'Background information about Civitas Gaya',
        'Permissions to use our symbols, texts or images in publications',
      ],
    },
    {
      slug: 'development',
      title: 'Development & Technical',
      email: 'dev@civitasgaya.org',
      description: 'For technical issues and contributions related to our digital infrastructure.',
      uses: [
        'Bug reports and security issues',
        'Questions about our platforms and tools',
        'Offers to contribute code, design or technical services',
      ],
    },
  ]

  const topics = [
    { value: 'government', label: 'Government & General Inquiries' },
    { value: 'legal', label: 'Legal & Constitutional Matters' },
    { value: 'immigration', label: 'Immigration & Citizenship' },
    { value: 'press', label: 'Press & Media' },
    { value: 'development', label: 'Development & Technical' },
    { value: 'other', label: 'Other' },
  ]

  let selectedTopic = $state('')
  $effect(() => { selectedTopic = form?.topic ?? '' })
  let consent = $state(false)
</script>

<svelte:head>
  <title>Contact · Civitas Gaya</title>
</svelte:head>

<!-- ─── HERO ─────────────────────────────────────────────── -->
<section
  class="relative overflow-hidden"
  style="height: 100dvh; margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style="background-image: url('/images/gaya-orbit.webp'); transform: translateY({bgOffset}px); will-change: transform; top: -20%; height: 140%;"
  ></div>
  <div class="absolute inset-0 bg-black/60"></div>

  <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
    <div class="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
      Get in Touch
    </div>
    <h1 class="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
      Contact<br /><span class="text-white/90">Civitas Gaya</span>
    </h1>
    <p class="mx-auto max-w-xl text-white/70">
      Choose the address that best matches your request, or use the contact form below.
      We read everything.
    </p>
  </div>
</section>

<!-- ─── CONTACT ADDRESSES ─────────────────────────────────── -->
<section
  class="py-24 border-b border-border"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Direct Contact</div>
    <h2 class="mb-4 text-3xl font-bold tracking-tight">Contact Addresses</h2>
    <p class="mb-12 max-w-2xl text-muted-foreground leading-relaxed">
      Please choose the topic that best matches your request so we can respond efficiently.
    </p>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each contacts as c}
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-base">{c.title}</Card.Title>
            <Card.Description>
              <a href="mailto:{c.email}" class="text-foreground hover:underline font-mono text-xs">{c.email}</a>
            </Card.Description>
          </Card.Header>
          <Card.Content class="space-y-3">
            <p class="text-sm text-muted-foreground">{c.description}</p>
            <ul class="space-y-1">
              {#each c.uses as use}
                <li class="flex gap-2.5 text-sm text-muted-foreground">
                  <span class="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40"></span>
                  {use}
                </li>
              {/each}
            </ul>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<!-- ─── CONTACT FORM ──────────────────────────────────────── -->
<section
  class="py-24"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    <div class="grid gap-16 lg:grid-cols-[1fr_2fr] lg:items-start">
      <div>
        <div class="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Contact Form</div>
        <h2 class="mb-4 text-3xl font-bold tracking-tight">Send us a message</h2>
        <p class="text-muted-foreground leading-relaxed">
          We aim to acknowledge all messages within a reasonable time and to respond as thoroughly
          as our volunteer structures allow.
        </p>
      </div>

      <div>
        {#if form?.success}
          <div class="rounded-lg border border-border bg-muted/50 px-6 py-10 text-center">
            <div class="mb-2 text-lg font-semibold">Message sent.</div>
            <p class="text-muted-foreground text-sm">
              Thank you for reaching out. We will get back to you as soon as possible.
            </p>
          </div>
        {:else}
          <form method="POST" class="space-y-6">
            {#if form?.error}
              <div class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {form.error}
              </div>
            {/if}

            <div class="space-y-2">
              <Label for="topic">Topic</Label>
              <Select.Root type="single" name="topic" bind:value={selectedTopic}>
                <Select.Trigger id="topic" class="w-full">
                  {topics.find(t => t.value === selectedTopic)?.label ?? 'Select a topic…'}
                </Select.Trigger>
                <Select.Content>
                  {#each topics as t}
                    <Select.Item value={t.value}>{t.label}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>

            <div class="space-y-2">
              <Label for="email">Your email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form?.email ?? ''}
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe your request clearly and concisely…"
                rows={6}
                value={form?.message ?? ''}
                required
              />
            </div>

            <div class="flex items-start gap-3">
              <Checkbox
                id="consent"
                name="consent"
                bind:checked={consent}
                class="mt-0.5"
              />
              <Label for="consent" class="text-sm font-normal text-muted-foreground leading-relaxed cursor-pointer">
                I agree that Civitas Gaya may store and use the information I provided above solely
                for the purpose of processing and responding to my enquiry.
              </Label>
            </div>

            <Button type="submit" disabled={!consent}>Send message</Button>
          </form>
        {/if}
      </div>
    </div>
  </div>
</section>
