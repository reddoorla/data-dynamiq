<script lang="ts">
  // a11y CI-gate fixture for the /dev/animate-in route. Kept self-contained and
  // axe-clean (light text on the black body); the audit disables transitions so
  // any reveal animation settles before axe runs.
  import AnimateIn from "$lib/components/AnimateIn.svelte";
</script>

<svelte:head><title>Animate-in demo | Data Dynamiq</title></svelte:head>

<div class="max-w-3xl mx-auto px-8 py-16 space-y-10 text-white text-left">
  <header class="space-y-2">
    <h1 class="text-3xl font-bold text-left">Animate-in demo</h1>
    <p class="text-left">
      Reveal-on-scroll demo route used by the accessibility CI gate.
    </p>
  </header>

  <section aria-labelledby="reveal-heading" class="space-y-3">
    <h2 id="reveal-heading" class="text-xl font-semibold">Revealed content</h2>
    <AnimateIn>
      <div class="p-8 border border-white rounded text-left">
        This block fades and slides into view on first intersection.
      </div>
    </AnimateIn>
  </section>
</div>
