<script lang="ts">
  import { marked } from 'marked'
  import { Badge } from '$lib/components/ui/badge'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const renderedHtml = $derived(
    data.constitution ? (marked.parse(data.constitution.content) as string) : ''
  )

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
  <title>Constitution · Civitas Gaya</title>
</svelte:head>

<!-- Hero — identical technique to landing page -->
<section
  class="relative overflow-hidden"
  style="height: 60dvh; min-height: 360px; margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style="background-image: url('/images/gaya-orbit.webp'); transform: translateY({bgOffset}px); will-change: transform; top: -20%; height: 140%;"
  ></div>
  <div class="absolute inset-0 bg-black/65"></div>

  <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
    <div class="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
      Founding Document
    </div>
    <h1 class="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
      {data.constitution?.title ?? 'Constitution of Civitas Gaya'}
    </h1>
    {#if data.constitution}
      <div class="flex items-center justify-center gap-3 mt-2">
        <Badge variant="outline" class="border-white/30 text-white/80 font-mono">
          v{data.constitution.versionLabel}
        </Badge>
        <span class="text-white/50 text-sm">
          Published {new Date(data.constitution.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    {/if}
  </div>
</section>

{#if !data.constitution}
  <div class="pt-16 pb-20 max-w-2xl">
    <div class="mb-2 text-sm text-muted-foreground">Legal Documents</div>
    <h2 class="mb-4 text-2xl font-bold tracking-tight">Not yet published</h2>
    <p class="text-muted-foreground leading-relaxed">
      The Constitution will be published here once adopted in digital assembly.
      This page will display the active version, its full history, and any pending amendment proposals.
    </p>
  </div>
{:else}
  <div class="py-16 max-w-3xl mx-auto">
    <article class="prose">
      {@html renderedHtml}
    </article>
  </div>
{/if}
