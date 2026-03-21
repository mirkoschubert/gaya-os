<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'
  import PublicHero from '$lib/components/public/PublicHero.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Laws & Regulations · Civitas Gaya</title>
</svelte:head>

<PublicHero
  badge="Legal Documents"
  title="Laws & Regulations"
  subtitle="All laws, organic statutes and regulations of Civitas Gaya - adopted through transparent participatory processes and published as public record."
  image="/images/gaya-law.webp"
/>

<section
  class="py-16"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="mx-auto max-w-7xl px-8 lg:px-16">
    {#if data.laws.length === 0}
      <p class="text-muted-foreground">No laws have been published yet.</p>
    {:else}
      <div class="divide-y divide-border border-t border-b">
        {#each data.laws as law}
          <a
            href="/laws/{law.slug}"
            class="flex items-center justify-between gap-4 py-6 text-foreground transition-colors group"
          >
            <div class="flex flex-col gap-1">
              <span class="font-medium group-hover:underline underline-offset-4">{law.title}</span>
              {#if law.publishedAt}
                <span class="text-xs text-muted-foreground">
                  Published {new Date(law.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              {/if}
            </div>
            {#if law.versionLabel}
              <Badge variant="outline" class="font-mono shrink-0">v{law.versionLabel}</Badge>
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</section>
