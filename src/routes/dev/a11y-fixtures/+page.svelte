<script lang="ts">
  // Self-contained accessibility fixtures for the Playwright + axe-core CI gate.
  // The site body is black (see app.html / app.css), so everything here is light
  // text on black, and links are forced light to beat the global dark `a` colour.
  // No placeholders (the global `::placeholder` colour is low-contrast on white).
  let submitted = $state(false);
</script>

<svelte:head><title>Accessibility fixtures | Data Dynamiq</title></svelte:head>

<div class="max-w-3xl mx-auto px-8 py-16 space-y-12 text-white text-left">
  <header class="space-y-2">
    <h1 class="text-3xl font-bold text-left">Accessibility fixtures</h1>
    <p class="text-left">
      Used by the Playwright + axe-core CI gate. Every primitive on this page is
      expected to pass WCAG 2.2 AA.
    </p>
  </header>

  <section aria-labelledby="form-heading" class="space-y-4">
    <h2 id="form-heading" class="text-xl font-semibold">Form</h2>
    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        submitted = true;
      }}
    >
      <div class="flex flex-col gap-1 items-start">
        <label for="fx-name">Name</label>
        <input
          id="fx-name"
          name="name"
          type="text"
          class="text-black px-2 py-1 rounded border border-white w-full max-w-sm"
        />
      </div>
      <div class="flex flex-col gap-1 items-start">
        <label for="fx-email">Email</label>
        <input
          id="fx-email"
          name="email"
          type="email"
          class="text-black px-2 py-1 rounded border border-white w-full max-w-sm"
        />
      </div>
      <div class="flex flex-col gap-1 items-start">
        <label for="fx-message">Message</label>
        <textarea
          id="fx-message"
          name="message"
          class="text-black px-2 py-1 rounded border border-white w-full max-w-sm"
        ></textarea>
      </div>
      <button
        type="submit"
        class="px-4 py-2 border-2 border-white rounded bump"
      >
        Submit
      </button>
      {#if submitted}
        <p role="status" class="text-left">Submitted.</p>
      {/if}
    </form>
  </section>

  <section aria-labelledby="links-heading" class="space-y-4">
    <h2 id="links-heading" class="text-xl font-semibold">Links</h2>
    <nav aria-label="Fixture links">
      <ul class="space-y-1">
        <li><a href="/" class="text-white! underline">Home</a></li>
        <li>
          <a href="/dev/animate-in" class="text-white! underline"
            >Animate-in demo</a
          >
        </li>
      </ul>
    </nav>
  </section>
</div>
