<script lang="ts">
  import { onMount } from 'svelte'
  import PublicHero from '$lib/components/public/PublicHero.svelte'

  const HEADER_H = 56 // h-14 = 3.5rem = 56px

  const sectionLabels = [
    'The Story of Civitas Gaya',
    'The Awakening',
    'Life on Gaya',
    'The First Councils',
    'The Others',
    'The Hard Question',
    'Return to Earth',
    'The Foundation Stone'
  ]

  let activeIndex = $state(0)
  let sectionEls: HTMLElement[] = $state([])

  onMount(() => {
    const parallaxEls = document.querySelectorAll<HTMLElement>('[data-parallax]')
    const fadeEls = document.querySelectorAll<HTMLElement>('[data-fade]')

    function tick() {
      const vh = window.innerHeight

      // Active section: which section's top is closest to the snap position
      let closest = 0
      let closestDist = Infinity
      sectionEls.forEach((el, i) => {
        if (!el) return
        // Section 0 snaps to top=0, sections 1-7 snap to top=HEADER_H
        const snapTarget = i === 0 ? 0 : HEADER_H
        const dist = Math.abs(el.getBoundingClientRect().top - snapTarget)
        if (dist < closestDist) {
          closestDist = dist
          closest = i
        }
      })
      activeIndex = closest

      // Parallax
      for (const el of parallaxEls) {
        const factor = parseFloat(el.dataset.parallax ?? '0.2')
        const scene = el.closest('[data-section]') as HTMLElement | null
        const anchor = scene ?? el.parentElement ?? el
        const rect = anchor.getBoundingClientRect()
        const centerOffset = rect.top + rect.height / 2 - vh / 2
        const progress = Math.max(-1, Math.min(1, centerOffset / (vh * 0.6)))
        el.style.transform = `translateY(${progress * vh * factor}px)`
      }

      // Fade
      for (const el of fadeEls) {
        const rect = el.getBoundingClientRect()
        const centerOffset = Math.abs(rect.top + rect.height / 2 - vh / 2)
        const opacity = Math.max(
          0,
          Math.min(1, 1 - (centerOffset - vh * 0.25) / (vh * 0.4))
        )
        el.style.opacity = String(opacity)
      }
    }

    tick()
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick, { passive: true })

    return () => {
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
    }
  })

  function scrollToSection(index: number) {
    sectionEls[index]?.scrollIntoView({ behavior: 'smooth' })
  }
</script>

<svelte:head>
  <title>History · Gaya OS</title>
</svelte:head>

<!-- ─── DOT NAVIGATOR ──────────────────────────────────────── -->
<nav class="dot-nav" aria-label="Story sections">
  {#each sectionLabels as label, i}
    <button
      class="dot"
      class:active={activeIndex === i}
      onclick={() => scrollToSection(i)}
      title={label}
      aria-label={label}
    ></button>
  {/each}
</nav>

<!-- ─── SECTION 0: Hero ────────────────────────────────────── -->
<div
  class="snap-section snap-section--hero"
  bind:this={sectionEls[0]}
  data-section="0"
>
  <PublicHero
    badge="History"
    title="The Story of Civitas Gaya"
    subtitle="We were few when we awoke. No angels, no devils - just a few dozen confused people in metal corridors under alien light."
    image="/images/gaya-history.webp"
  />
</div>

<!-- ─── SECTION 1: The Awakening ──────────────────────────── -->
<section
  class="snap-section border-t border-border"
  bind:this={sectionEls[1]}
  data-section="1"
>
  <div class="section-inner">
    <div class="relative mx-auto max-w-7xl px-8 lg:px-16 w-full">
      <div
        class="hidden lg:block absolute right-8 lg:right-16 rounded-2xl overflow-hidden"
        data-parallax="0.15"
        style="top: 0; width: 52%; aspect-ratio: 16/9; will-change: transform;"
      >
        <img src="/images/gaya-history-story-01.webp" alt="" class="w-full h-full object-cover" />
      </div>

      <div
        class="relative lg:w-[48%] bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-6 lg:p-8"
        data-parallax="0.22"
        style="margin-top: clamp(1rem, 6vh, 5rem); will-change: transform; z-index: 10;"
      >
        <h2 class="mb-4 text-2xl lg:text-3xl font-bold tracking-tight">The Awakening</h2>
        <p class="text-sm lg:text-base text-muted-foreground leading-relaxed">
          We were few when we awoke. No angels, no devils - just a few dozen
          confused people in metal corridors under alien light. Earth's records
          list us as missing persons, accident victims, casualties of war. All I
          remember is the smell of metal, the soft vibration of the walls, and a
          warm glow that was not a sunrise.
        </p>
        <p class="mt-3 text-sm lg:text-base text-muted-foreground leading-relaxed">
          Through a round porthole we saw Helion for the first time: larger than
          the sun, more golden, quieter. We later learned that people on Earth
          call it Epsilon Eridani - an orange star just over ten light-years away.
          Below us lay a planet, half wrapped in clouds, half in dark expanses of
          ocean and forest. Gaya. Whoever had brought us there kept silent.
          Those we now call "the Architects" could only be sensed through their
          preparation: domes, tanks, seeds, tools, simple machines. Enough to
          survive - but no manual, no orders. It felt like: <em
            >"Here, try it. We're watching."</em
          >
        </p>
      </div>

      <div class="lg:hidden mt-4 rounded-2xl overflow-hidden aspect-video w-full">
        <img src="/images/test-image.webp" alt="" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</section>

<!-- ─── SECTION 2: Life on Gaya ───────────────────────────── -->
<section
  class="snap-section border-t border-border"
  bind:this={sectionEls[2]}
  data-section="2"
>
  <div class="section-inner items-center justify-center">
    <div class="px-8 max-w-3xl mx-auto text-center space-y-4 lg:space-y-6" data-fade>
      <p class="text-lg sm:text-xl lg:text-2xl leading-relaxed text-muted-foreground">
        On Gaya nothing was self-evident. The forests were dense and dark,
        some plants shimmered in the oblique light of Helion, the seas glowed at
        night as if stars lay in the water. The air was breathable, but capricious
        - a single storm could wipe out an entire settlement.
      </p>
      <p class="text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium text-foreground">
        It became clear quickly: there was no room for kings. So we sat down
        together - everyone affected. And that was always all of us.
      </p>
    </div>
  </div>
</section>

<!-- ─── SECTION 3: The First Councils ────────────────────── -->
<section
  class="snap-section border-t border-border"
  bind:this={sectionEls[3]}
  data-section="3"
>
  <div class="section-inner">
    <div class="relative mx-auto max-w-7xl px-8 lg:px-16 w-full">
      <div
        class="hidden lg:block absolute left-8 lg:left-16 rounded-2xl overflow-hidden"
        data-parallax="0.12"
        style="top: clamp(1rem, 4vh, 3rem); width: 50%; aspect-ratio: 16/9; will-change: transform;"
      >
        <img src="/images/gaya-history-story-02.webp" alt="" class="w-full h-full object-cover" />
      </div>

      <div
        class="relative lg:w-[48%] lg:ml-auto bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-6 lg:p-8"
        data-parallax="0.22"
        style="margin-top: clamp(1rem, 6vh, 5rem); will-change: transform; z-index: 10;"
      >
        <h2 class="mb-4 text-2xl lg:text-3xl font-bold tracking-tight">The First Councils</h2>
        <p class="text-sm lg:text-base text-muted-foreground leading-relaxed">
          The first councils did not emerge from theory, but from hunger and fear.
          Who could fix water pipes? Who understood plants? Who could defuse a
          dispute before someone turned a tool into a weapon?
        </p>
        <p class="mt-3 text-sm lg:text-base text-muted-foreground leading-relaxed">
          We decided that no one should hold office permanently, that important
          decisions had to be justified and recorded, and that every person
          affected by a decision must at least be heard. At first this was pure
          pragmatism. But with each winter we survived this way, it became a
          principle: <em>power must not stand still, it must flow.</em>
        </p>
        <p class="mt-3 text-sm lg:text-base text-muted-foreground leading-relaxed">
          Over the years we settled only a narrow belt of Gaya: a chain of
          valleys, lakes, and sheltered coastlines where climate and soil were
          reasonably reliable. We brought our plants, our microbes, our stories -
          and placed them alongside what was already there. From this emerged a
          new, fragile order: neither pure colony nor mere adaptation.
        </p>
      </div>

      <div class="lg:hidden mt-4 rounded-2xl overflow-hidden aspect-video w-full">
        <img src="/images/test-image.webp" alt="" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</section>

<!-- ─── SECTION 4: The Others ─────────────────────────────── -->
<section
  class="snap-section border-t border-border"
  bind:this={sectionEls[4]}
  data-section="4"
>
  <div class="section-inner items-center justify-center">
    <div class="px-8 max-w-3xl mx-auto text-center space-y-4 lg:space-y-6" data-fade>
      <p class="text-lg sm:text-xl lg:text-2xl leading-relaxed text-muted-foreground">
        The Architects remained silent. Instead, other actors stepped forward -
        disturbances, patterns, probes. Structures in orbit repaired themselves
        when we attacked them. Signals pointed to intelligence, but not one that
        had our survival as its goal.
      </p>
      <p class="text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium text-foreground">
        To these Others we were data points, interference, or raw material - not
        partners.
      </p>
    </div>
  </div>
</section>

<!-- ─── SECTION 5: The Hard Question ─────────────────────── -->
<section
  class="snap-section border-t border-border"
  bind:this={sectionEls[5]}
  data-section="5"
>
  <div class="section-inner">
    <div class="relative mx-auto max-w-7xl px-8 lg:px-16 w-full">
      <div
        class="hidden lg:block absolute right-8 lg:right-16 rounded-2xl overflow-hidden"
        data-parallax="0.1"
        style="top: 0; width: 58%; aspect-ratio: 16/9; will-change: transform;"
      >
        <img src="/images/gaya-history-story-03.webp" alt="" class="w-full h-full object-cover" />
      </div>

      <div
        class="relative lg:w-[44%] bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-6 lg:p-8"
        data-parallax="0.24"
        style="margin-top: clamp(1rem, 8vh, 7rem); will-change: transform; z-index: 10;"
      >
        <h2 class="mb-4 text-2xl lg:text-3xl font-bold tracking-tight">The Hard Question</h2>
        <p class="text-sm lg:text-base text-muted-foreground leading-relaxed">
          At some point we faced a decision that divided us more deeply than any
          storm. Some said:
          <em
            >"We must centralise - strong defence, clear chains of command, one
            council above all councils. Otherwise we perish."</em
          >
          Others pushed back:
          <em
            >"If we sacrifice our councils to survive, does Civitas Gaya survive -
            or only a new variant of the same authority we fled?"</em
          >
        </p>
        <p class="mt-3 text-sm lg:text-base text-muted-foreground leading-relaxed">
          We argued through nights, voices grew hoarse, protocols grew longer. In
          the end, one bitter insight remained: if our values are to be more than
          fine words, we cannot sacrifice them for a war we did not choose. The
          third option was the hardest: leave. Not all, not at once - but enough
          to secure a future elsewhere.
        </p>
        <p class="mt-3 text-sm lg:text-base text-muted-foreground leading-relaxed">
          Over decades our engineers and researchers had taken apart and
          reassembled relics of the Architects: drives that hook into the fabric
          between the stars; habitats capable of sustaining a small community for
          a long time; navigation that reads not just stars but the fine murmur of
          the galaxy. From this came no proud fleets - but boats for a quiet
          evacuation.
        </p>
      </div>

      <div class="lg:hidden mt-4 rounded-2xl overflow-hidden aspect-video w-full">
        <img src="/images/test-image.webp" alt="" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</section>

<!-- ─── SECTION 6: Return to Earth ───────────────────────── -->
<section
  class="snap-section border-t border-border"
  bind:this={sectionEls[6]}
  data-section="6"
>
  <div class="section-inner">
    <div class="relative mx-auto max-w-7xl px-8 lg:px-16 w-full">
      <div
        class="hidden lg:block absolute left-8 lg:left-16 rounded-2xl overflow-hidden"
        data-parallax="0.18"
        style="top: clamp(1rem, 3vh, 2.5rem); width: 50%; aspect-ratio: 16/9; will-change: transform;"
      >
        <img src="/images/gaya-history-story-04.webp" alt="" class="w-full h-full object-cover" />
      </div>

      <div
        class="relative lg:w-[48%] lg:ml-auto bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-6 lg:p-8"
        data-parallax="0.22"
        style="margin-top: clamp(1rem, 6vh, 5rem); will-change: transform; z-index: 10;"
      >
        <h2 class="mb-4 text-2xl lg:text-3xl font-bold tracking-tight">Return to Earth</h2>
        <p class="text-sm lg:text-base text-muted-foreground leading-relaxed">
          Earth was no myth to us - it was a radio signal with coordinates. We
          knew that states, borders, and old forms of authority existed there. But
          we also knew that people lived there who had words for justice, dignity,
          and resistance. It was not a safe harbour, but the only place where our
          story could be understood at all. So we set out in waves. Some of our
          vessels reached Earth; others we lost sight of.
        </p>
        <p class="mt-3 text-sm lg:text-base text-muted-foreground leading-relaxed">
          On Earth we scattered. We took new names, found work, started families.
          Much of Gaya fell silent - out of fear of not being believed, out
          of exhaustion, out of the simple desire to be "just" human for once. But
          certain things persisted: an aversion to blind obedience, the need to
          discuss important matters in a circle, the habit of writing decisions
          down and justifying them. Eventually people met who knew the same
          fragments. From those encounters, Civitas Gaya in Exile was born.
        </p>
      </div>

      <div class="lg:hidden mt-4 rounded-2xl overflow-hidden aspect-video w-full">
        <img src="/images/test-image.webp" alt="" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</section>

<!-- ─── SECTION 7: The Foundation Stone ──────────────────── -->
<section
  class="snap-section snap-section--last border-t border-border relative overflow-hidden"
  bind:this={sectionEls[7]}
  data-section="7"
>
  <div
    class="absolute inset-0"
    style="background-image: url('/images/gaya-history-foundation-stone.webp'); background-size: cover; background-position: 70% center;"
  ></div>
  <div class="absolute inset-0 bg-black/20"></div>
  <div class="section-inner relative z-10">
    <div class="px-8 max-w-7xl mx-auto w-full">
      <div class="max-w-xl" data-fade>
        <h2 class="mb-6 text-2xl lg:text-3xl font-bold tracking-tight text-white">
          The Foundation Stone
        </h2>
        <p class="mb-4 text-sm lg:text-base text-white/70 leading-relaxed">
          When we gather today around the Gaya Foundation Stone - an unremarkable
          stone on a table somewhere on this Earth - it matters little whether it
          truly once lay in a forest beneath Helion. What matters is what we do
          around it: we tell our story, we give ourselves a constitution, we hold
          one another to sharing power and raising no one above the rest.
        </p>
        <p class="text-sm lg:text-base text-white/70 leading-relaxed">
          And wherever one of us stands up and says <em
            >"I am a citizen of Civitas Gaya"</em
          > and acts by these principles, the ground beneath our feet feels, for a moment,
          like a piece of Gaya - not as an escape from this world, but as a promise
          to treat it better than either world has treated us.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  /* Activate snap on html only on this page, without touching overflow */
  :global(html:has(.snap-section)) {
    scroll-snap-type: y mandatory;
    scroll-padding-top: 3.5rem; /* compensate for sticky header h-14 */
  }

  /* Each snap section fills exactly one viewport */
  .snap-section {
    height: 100dvh;
    scroll-snap-align: start;
    position: relative;
    /* Break out of layout max-w-7xl */
    margin-left: calc(50% - 50vw);
    width: 100vw;
  }

  /* Hero wrapper: give it the same full-bleed breakout as other sections.
     Height subtracts the sticky header so it matches every other page. */
  .snap-section--hero {
    height: calc(100dvh - 3.5rem);
  }

  /* Vertically centered content, NO overflow scroll - content must fit */
  .section-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    /* Top padding clears the sticky header */
    padding-top: calc(3.5rem + clamp(0.5rem, 2vh, 1.5rem));
    padding-bottom: clamp(1rem, 3vh, 2rem);
    overflow: hidden;
  }

  /* Last section snaps normally */
  .snap-section--last {
    scroll-snap-align: start;
  }

  /* Footer becomes a snap target only on this page */
  :global(html:has(.snap-section) footer) {
    scroll-snap-align: start;
  }

  [data-fade] {
    opacity: 0;
    will-change: opacity;
  }

  /* ─── Dot Navigator ──────────────────────────────────── */
  .dot-nav {
    position: fixed;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  /* White fill + dark shadow ring = visible on any background */
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    border: none;
    padding: 0;
    cursor: pointer;
    box-shadow:
      0 0 0 1.5px rgba(0, 0, 0, 0.35),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      opacity 0.25s ease;
    opacity: 0.7;
  }

  .dot:hover {
    opacity: 1;
    box-shadow:
      0 0 0 1.5px rgba(0, 0, 0, 0.5),
      0 1px 4px rgba(0, 0, 0, 0.4);
  }

  .dot.active {
    opacity: 1;
    transform: scale(1.5);
    box-shadow:
      0 0 0 2px rgba(0, 0, 0, 0.4),
      0 1px 5px rgba(0, 0, 0, 0.5);
  }
</style>
