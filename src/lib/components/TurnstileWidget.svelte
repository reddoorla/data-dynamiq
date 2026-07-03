<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { loadTurnstile } from "$lib/turnstile";

  // Optional Cloudflare Turnstile. Dark until PUBLIC_TURNSTILE_SITE_KEY is set
  // (trimmed so a stray-whitespace value stays dark). Rendered explicitly so it
  // works on full load AND SvelteKit SPA nav. The visible widget lives here in
  // the real UI (not the hidden Netlify form, which is display:none and can't
  // run a challenge); it reports its token up via `onToken` so the submit helper
  // can forward `cf-turnstile-response` to central verify.
  let { onToken }: { onToken?: (token: string) => void } = $props();

  const turnstileSiteKey = env.PUBLIC_TURNSTILE_SITE_KEY?.trim();
  let turnstileEl = $state<HTMLDivElement>();

  $effect(() => {
    const el = turnstileEl;
    if (!turnstileSiteKey || !el) return;
    let widgetId: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !el.isConnected) return;
        widgetId = turnstile.render(el, {
          sitekey: turnstileSiteKey,
          callback: (t: string) => onToken?.(t),
        });
      })
      .catch((err) => {
        // Offline / blocked / misconfigured sitekey: central ingest is fail-open,
        // so a missing token degrades to honeypot + heuristic scoring, never a
        // dropped lead. Warn so an operator can triage.
        console.warn("[turnstile] widget did not render:", err);
      });
    return () => {
      cancelled = true;
      onToken?.("");
      if (widgetId !== undefined) {
        try {
          window.turnstile?.remove(widgetId);
        } catch {
          // Widget already torn down (e.g. by navigation) — nothing to clean up.
        }
      }
    };
  });
</script>

{#if turnstileSiteKey}
  <!-- Cloudflare Turnstile mount point; the effect renders it explicitly and
	     reports the issued token to the parent via `onToken`. -->
  <div class="cf-turnstile" bind:this={turnstileEl}></div>
{/if}
