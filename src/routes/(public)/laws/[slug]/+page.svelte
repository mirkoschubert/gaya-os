<script lang="ts">
  import { marked } from 'marked'
  import { Badge } from '$lib/components/ui/badge'
  import PublicHero from '$lib/components/public/PublicHero.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const renderedHtml = $derived(
    data.document ? (marked.parse(data.document.content) as string) : ''
  )
</script>

<svelte:head>
  <title>{data.title} · Civitas Gaya</title>
</svelte:head>

<PublicHero
  badge="Laws & Regulations"
  title={data.title}
  image="/images/gaya-law.webp"
  overlay="bg-black/65"
>
  {#snippet afterTitle()}
    {#if data.document}
      <div class="flex items-center justify-center gap-3 mt-2 mb-8">
        <Badge variant="outline" class="border-white/30 text-white/80 font-mono">
          v{data.document.versionLabel}
        </Badge>
        <span class="text-white/50 text-sm">
          Published {new Date(data.document.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    {/if}
  {/snippet}
</PublicHero>

{#if !data.document}
  <div class="pt-16 pb-20 max-w-2xl">
    <div class="mb-2 text-sm text-muted-foreground">Laws & Regulations</div>
    <h2 class="mb-4 text-2xl font-bold tracking-tight">Not yet published</h2>
    <p class="text-muted-foreground leading-relaxed">
      This law will be published here once adopted in digital assembly.
    </p>
  </div>
{:else}
  <div class="py-16 max-w-3xl mx-auto">
    <article class="prose">
      {@html renderedHtml}
    </article>
  </div>
{/if}
