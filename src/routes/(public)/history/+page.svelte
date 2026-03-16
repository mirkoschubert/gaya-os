<script lang="ts">
  import { onMount } from 'svelte'

  onMount(() => {
    const parallaxEls =
      document.querySelectorAll<HTMLElement>('[data-parallax]')
    const fadeEls = document.querySelectorAll<HTMLElement>('[data-fade]')

    function tick() {
      const vh = window.innerHeight

      // Parallax: use parent .scene as anchor to avoid transform feedback loop
      for (const el of parallaxEls) {
        const factor = parseFloat(el.dataset.parallax ?? '0.2')
        const scene = el.closest('.scene') as HTMLElement | null
        const anchor = scene ?? el.parentElement ?? el
        const rect = anchor.getBoundingClientRect()
        const centerOffset = rect.top + rect.height / 2 - vh / 2
        const progress = Math.max(-1, Math.min(1, centerOffset / (vh * 0.6)))
        el.style.transform = `translateY(${progress * vh * factor}px)`
      }

      // Fade: opacity based on how centered the element is in the viewport
      for (const el of fadeEls) {
        const rect = el.getBoundingClientRect()
        const centerOffset = Math.abs(rect.top + rect.height / 2 - vh / 2)
        // Fully visible when center is within 30% of viewport height from middle
        // Fades out toward 0 at 70% of viewport height from middle
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
</script>

<svelte:head>
  <title>History · Gaya OS</title>
</svelte:head>

<!-- ─── INTRO ──────────────────────────────────────────────── -->
<div
  class="relative flex min-h-dvh flex-col items-center justify-center text-center overflow-hidden"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <!-- Parallax background -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    data-parallax="0.15"
    style="background-image: url('/images/gaya-orbit.webp'); top: -20%; height: 140%; will-change: transform;"
  ></div>
  <div class="absolute inset-0 bg-black/55"></div>

  <div class="relative z-10 px-8 max-w-5xl mx-auto">
    <div
      class="mb-4 text-xs font-medium uppercase tracking-widest text-white/60"
    >
      History
    </div>
    <h1
      class="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
    >
      The Story of<br />Civitas Gaya
    </h1>
    <p class="mx-auto max-w-lg text-lg text-white/70 leading-relaxed">
      We were few when we awoke. No angels, no devils — just a few dozen
      confused people in metal corridors under alien light.
    </p>
  </div>
</div>

<!-- ─── SCENE 1: The Awakening + Helion ───────────────────── -->
<section
  class="scene"
  style="margin-left: calc(50% - 50vw); width: 100vw; padding: 12vh 0 16vh;"
>
  <div class="relative mx-auto max-w-7xl px-8 lg:px-16">
    <div
      class="hidden lg:block absolute right-8 lg:right-16 rounded-2xl overflow-hidden"
      data-parallax="0.15"
      style="top: 0; width: 52%; aspect-ratio: 16/9; will-change: transform;"
    >
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>

    <div
      class="relative lg:w-[48%] bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-8 lg:p-10"
      data-parallax="0.38"
      style="margin-top: 120px; will-change: transform; z-index: 10;"
    >
      <h2 class="mb-6 text-3xl font-bold tracking-tight">The Awakening</h2>
      <p class="text-muted-foreground leading-relaxed">
        We were few when we awoke. No angels, no devils — just a few dozen
        confused people in metal corridors under alien light. Earth's records
        list us as missing persons, accident victims, casualties of war. All I
        remember is the smell of metal, the soft vibration of the walls, and a
        warm glow that was not a sunrise.
      </p>
      <p class="mt-4 text-muted-foreground leading-relaxed">
        Through a round porthole we saw Helion for the first time: larger than
        the sun, more golden, quieter. We later learned that people on Earth
        call it Epsilon Eridani — an orange star just over ten light-years away.
        Below us lay a planet, half wrapped in clouds, half in dark expanses of
        ocean and forest. Gaya Prime. Whoever had brought us there kept silent.
        Those we now call "the Architects" could only be sensed through their
        preparation: domes, tanks, seeds, tools, simple machines. Enough to
        survive — but no manual, no orders. It felt like: <em
          >"Here, try it. We're watching."</em
        >
      </p>
    </div>

    <div class="lg:hidden mt-8 rounded-2xl overflow-hidden aspect-video w-full">
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</section>

<!-- ─── HIGHLIGHT 1 ────────────────────────────────────────── -->
<section
  class="flex min-h-dvh items-center justify-center"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="px-8 max-w-3xl mx-auto text-center space-y-6" data-fade>
    <p class="text-xl sm:text-2xl leading-relaxed text-muted-foreground">
      On Gaya Prime nothing was self-evident. The forests were dense and dark,
      some plants shimmered in the oblique light of Helion, the seas glowed at
      night as if stars lay in the water. The air was breathable, but capricious
      — a single storm could wipe out an entire settlement.
    </p>
    <p class="text-xl sm:text-2xl leading-relaxed font-medium text-foreground">
      It became clear quickly: there was no room for kings. So we sat down
      together — everyone affected. And that was always all of us.
    </p>
  </div>
</section>

<!-- ─── SCENE 2: The First Councils ──────────────────────── -->
<section
  class="scene"
  style="margin-left: calc(50% - 50vw); width: 100vw; padding: 12vh 0 16vh;"
>
  <div class="relative mx-auto max-w-7xl px-8 lg:px-16">
    <div
      class="hidden lg:block absolute left-8 lg:left-16 rounded-2xl overflow-hidden"
      data-parallax="0.12"
      style="top: 80px; width: 50%; aspect-ratio: 16/9; will-change: transform;"
    >
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>

    <div
      class="relative lg:w-[48%] lg:ml-auto bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-8 lg:p-10"
      data-parallax="0.35"
      style="will-change: transform; z-index: 10;"
    >
      <h2 class="mb-6 text-3xl font-bold tracking-tight">
        The First Councils
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        The first councils did not emerge from theory, but from hunger and fear.
        Who could fix water pipes? Who understood plants? Who could defuse a
        dispute before someone turned a tool into a weapon?
      </p>
      <p class="mt-4 text-muted-foreground leading-relaxed">
        We decided that no one should hold office permanently, that important
        decisions had to be justified and recorded, and that every person
        affected by a decision must at least be heard. At first this was pure
        pragmatism. But with each winter we survived this way, it became a
        principle: <em>power must not stand still — it must flow.</em>
      </p>
      <p class="mt-4 text-muted-foreground leading-relaxed">
        Over the years we settled only a narrow belt of Gaya Prime: a chain of
        valleys, lakes, and sheltered coastlines where climate and soil were
        reasonably reliable. We brought our plants, our microbes, our stories —
        and placed them alongside what was already there. From this emerged a
        new, fragile order: neither pure colony nor mere adaptation.
      </p>
    </div>

    <div class="lg:hidden mt-8 rounded-2xl overflow-hidden aspect-video w-full">
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</section>

<!-- ─── HIGHLIGHT 2 ────────────────────────────────────────── -->
<section
  class="flex min-h-dvh items-center justify-center"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <div class="px-8 max-w-3xl mx-auto text-center space-y-6" data-fade>
    <p class="text-xl sm:text-2xl leading-relaxed text-muted-foreground">
      The Architects remained silent. Instead, other actors stepped forward —
      disturbances, patterns, probes. Structures in orbit repaired themselves
      when we attacked them. Signals pointed to intelligence, but not one that
      had our survival as its goal.
    </p>
    <p class="text-xl sm:text-2xl leading-relaxed font-medium text-foreground">
      To these Others we were data points, interference, or raw material — not
      partners.
    </p>
  </div>
</section>

<!-- ─── SCENE 3: The Decision + Departure ─────────────────── -->
<section
  class="scene"
  style="margin-left: calc(50% - 50vw); width: 100vw; padding: 12vh 0 16vh;"
>
  <div class="relative mx-auto max-w-7xl px-8 lg:px-16">
    <div
      class="hidden lg:block absolute right-8 lg:right-16 rounded-2xl overflow-hidden"
      data-parallax="0.1"
      style="top: 0; width: 58%; aspect-ratio: 16/9; will-change: transform;"
    >
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>

    <div
      class="relative lg:w-[44%] bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-8 lg:p-10"
      data-parallax="0.4"
      style="margin-top: 160px; will-change: transform; z-index: 10;"
    >
      <h2 class="mb-6 text-3xl font-bold tracking-tight">
        The Hard Question
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        At some point we faced a decision that divided us more deeply than any
        storm. Some said:
        <em
          >"We must centralise — strong defence, clear chains of command, one
          council above all councils. Otherwise we perish."</em
        >
        Others pushed back:
        <em
          >"If we sacrifice our councils to survive, does Civitas Gaya survive —
          or only a new variant of the same authority we fled?"</em
        >
      </p>
      <p class="mt-4 text-muted-foreground leading-relaxed">
        We argued through nights, voices grew hoarse, protocols grew longer. In
        the end, one bitter insight remained: if our values are to be more than
        fine words, we cannot sacrifice them for a war we did not choose. The
        third option was the hardest: leave. Not all, not at once — but enough
        to secure a future elsewhere.
      </p>
      <p class="mt-4 text-muted-foreground leading-relaxed">
        Over decades our engineers and researchers had taken apart and
        reassembled relics of the Architects: drives that hook into the fabric
        between the stars; habitats capable of sustaining a small community for
        a long time; navigation that reads not just stars but the fine murmur of
        the galaxy. From this came no proud fleets — but boats for a quiet
        evacuation.
      </p>
    </div>

    <div class="lg:hidden mt-8 rounded-2xl overflow-hidden aspect-video w-full">
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</section>

<!-- ─── SCENE 4: Return + Exile ───────────────────────────── -->
<section
  class="scene"
  style="margin-left: calc(50% - 50vw); width: 100vw; padding: 12vh 0 16vh;"
>
  <div class="relative mx-auto max-w-7xl px-8 lg:px-16">
    <div
      class="hidden lg:block absolute left-8 lg:left-16 rounded-2xl overflow-hidden"
      data-parallax="0.18"
      style="top: 40px; width: 50%; aspect-ratio: 16/9; will-change: transform;"
    >
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>

    <div
      class="relative lg:w-[48%] lg:ml-auto bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm p-8 lg:p-10"
      data-parallax="0.32"
      style="margin-top: 100px; will-change: transform; z-index: 10;"
    >
      <h2 class="mb-6 text-3xl font-bold tracking-tight">
        Return to Earth
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        Earth was no myth to us — it was a radio signal with coordinates. We
        knew that states, borders, and old forms of authority existed there. But
        we also knew that people lived there who had words for justice, dignity,
        and resistance. It was not a safe harbour, but the only place where our
        story could be understood at all. So we set out in waves. Some of our
        vessels reached Earth; others we lost sight of.
      </p>
      <p class="mt-4 text-muted-foreground leading-relaxed">
        On Earth we scattered. We took new names, found work, started families.
        Much of Gaya Prime fell silent — out of fear of not being believed, out
        of exhaustion, out of the simple desire to be "just" human for once. But
        certain things persisted: an aversion to blind obedience, the need to
        discuss important matters in a circle, the habit of writing decisions
        down and justifying them. Eventually people met who knew the same
        fragments. From those encounters, Civitas Gaya in Exile was born.
      </p>
    </div>

    <div class="lg:hidden mt-8 rounded-2xl overflow-hidden aspect-video w-full">
      <img
        src="/images/test-image.webp"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</section>

<!-- ─── FINAL: The Foundation Stone ──────────────────────── -->
<section
  class="relative flex min-h-dvh items-center overflow-hidden"
  style="margin-left: calc(50% - 50vw); width: 100vw;"
>
  <!-- Full background image with parallax, like the hero -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    data-parallax="0.15"
    style="background-image: url('/images/test-image.webp'); top: -20%; height: 140%; will-change: transform;"
  ></div>
  <div class="absolute inset-0 bg-black/55"></div>

  <!-- Text: left-aligned, fades in -->
  <div class="relative z-10 px-8 max-w-7xl mx-auto w-full">
    <div class="max-w-xl" data-fade>
      <h2 class="mb-8 text-3xl font-bold tracking-tight text-white">
        The Foundation Stone
      </h2>
      <p class="mb-6 text-lg text-white/70 leading-relaxed">
        When we gather today around the Gaya Foundation Stone — an unremarkable
        stone on a table somewhere on this Earth — it matters little whether it
        truly once lay in a forest beneath Helion. What matters is what we do
        around it: we tell our story, we give ourselves a constitution, we hold
        one another to sharing power and raising no one above the rest.
      </p>
      <p class="text-lg text-white/70 leading-relaxed">
        And wherever one of us stands up and says <em
          >"I am a citizen of Civitas Gaya"</em
        > and acts by these principles, the ground beneath our feet feels, for a moment,
        like a piece of Gaya Prime — not as an escape from this world, but as a promise
        to treat it better than either world has treated us.
      </p>
    </div>
  </div>
</section>

<style>
  .scene {
    min-height: 100dvh;
    position: relative;
    overflow: hidden;
  }

  [data-fade] {
    opacity: 0;
    will-change: opacity;
  }
</style>
