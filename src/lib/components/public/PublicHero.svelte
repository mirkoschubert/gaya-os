<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { ChevronDown } from '@lucide/svelte'
  import type { Snippet } from 'svelte'

  interface Action {
    href: string
    label: string
    variant?: 'default' | 'outline'
  }

  interface Props {
    image?: string
    badge?: string
    title: string
    subtitle?: string
    primaryAction?: Action
    secondaryAction?: Action
    height?: string
    overlay?: string
    afterTitle?: Snippet
  }

  let {
    image = '/images/gaya-orbit.webp',
    badge,
    title,
    subtitle,
    primaryAction,
    secondaryAction,
    height = 'calc(100dvh - 3.5rem)',
    overlay = 'bg-black/40',
    afterTitle
  }: Props = $props()

  let bgOffset = $state(0)

  $effect(() => {
    function handleScroll() {
      bgOffset = window.scrollY * 0.4
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })
</script>

<section
  class="relative overflow-hidden"
  style="height: {height}; min-height: 360px; margin-left: calc(50% - 50vw); width: 100vw;"
>
  <!-- Parallax Background -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style="background-image: url('{image}'); transform: translateY({bgOffset}px); will-change: transform; top: -20%; height: 140%;"
  ></div>

  <!-- Overlay -->
  <div class="absolute inset-0 {overlay}"></div>

  <!-- Content -->
  <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
    {#if badge}
      <div
        class="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
      >
        {badge}
      </div>
    {/if}

    <h1 class="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
      {title}
    </h1>

    {#if afterTitle}
      {@render afterTitle()}
    {/if}

    {#if subtitle}
      <p class="mx-auto mb-8 max-w-xl text-white/70">
        {subtitle}
      </p>
    {/if}

    {#if primaryAction || secondaryAction}
      <div class="flex justify-center gap-3">
        {#if primaryAction}
          <Button href={primaryAction.href} variant={primaryAction.variant ?? 'default'}>
            {primaryAction.label}
          </Button>
        {/if}
        {#if secondaryAction}
          <Button
            href={secondaryAction.href}
            variant={secondaryAction.variant ?? 'outline'}
            class="border-white/30 text-white hover:bg-white/10"
          >
            {secondaryAction.label}
          </Button>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
    <span class="text-xs tracking-widest uppercase">Scroll</span>
    <ChevronDown class="size-4 animate-bounce" />
  </div>
</section>
