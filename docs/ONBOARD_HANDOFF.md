# data-dynamiq onboard — handoff (Commit 1 done, Commits 2–7 + wiring remain)

This repo is mid-migration on branch **`maint/onboard-svelte5`**. **Commit 1 (stack bump)**
is done and pushed: deps + configs are on the reddoor-starter stack (Svelte 5 / Vite 8 /
Tailwind 4 / pnpm / adapter-netlify / flat eslint), and `pnpm vite:dev` boots with `GET / → 200`.
The `.svelte` files are **still Svelte 4 syntax**, running in Svelte 5 legacy mode.

Follow the `svelte4-to-5-upgrade` skill (`~/.claude/skills/svelte4-to-5-upgrade/`). Canonical
end-state shape: `~/Documents/GitHub/reddoor-starter/`. Below is what's left, with the
data-dynamiq-specific findings baked in.

## State at handoff (verified)

| Item | Status |
| --- | --- |
| `pnpm install` | clean (`@scarf/scarf` build-script ignored — leave it, it's telemetry) |
| `svelte-kit sync` | exit 0 |
| `pnpm vite:dev` | boots, `GET / → 200` |
| Tailwind | **still v3 directives** in `src/app.css` (`@tailwind base/...`) → Commit 2 |
| `@prismicio/svelte` v2 | already loads under Svelte 5 legacy mode — no revert needed |
| `svelte-gestures` | **kept at ^4** on purpose — v5 dropped the `{ swipe }` export and crashes the homepage; the v5 `useSwipe` swap is `.svelte` work → Commit 5 |

## Migration scope (greps run on Commit-1 tree)

- `export let`: **29 files** · `on:` handlers: **19 files** · `<slot`: **7 files**
- `svelte-gestures`: **10 files** (incl. the homepage `src/routes/[[preview=preview]]/+page.svelte:33`)
- `@prismicio/svelte`: 6 files · `svelte-select` (5.8.3): 3 files + `src/app.css` overrides · `svelte-turnstile`: homepage
- FontAwesome **CDN `<i class="fa-…">`: 3 files** + the Kit `<script src="https://kit.fontawesome.com/78a9146bce.js">` in `src/app.html` (no npm FA `<i>` in components — the `@fortawesome/*` deps may be dead; confirm before dropping)

## Remaining commits

### Commit 2 — Tailwind 4 CSS-only migration

Rewrite `src/app.css`: replace the three `@tailwind` directives with `@import "tailwindcss";`,
then add an `@theme {}` block transcribed from the **current `tailwind.config.js`**, and
**delete `tailwind.config.js`**. Watch the two pre-existing bugs in that config:

- **`height` is massively duplicated** (`screen-75/50/25/10/5` repeated ~5×, `screen-75` again
  inside) — dedupe in transit. Also note bogus values to drop/verify: `'512': '128rem'`,
  `'640': '160rem'`, and `'proportion': 'proportion'` (not a length).
- Breakpoints use Tailwind-4 token names: `--breakpoint-sm: 560px` … (NOT `--screen-*`).
- Colors: `light:#C2D1D9`, `dark:#424B5A`, `primary:#0D7AA3`, plus transparent/current/black/white.
- Easings → `--ease-in-expo` / `--ease-out-expo` / `--ease-fast-slow`.
- Custom heights → `--height-112: 28rem` … `--height-384: 96rem`.
- **safelist → `@source inline(...)`**: the config safelists `justify-{center,start,end,between,around}`,
  `sm:justify-{center,start,end}`, `hidden`, `aspect-square/video/[16/9]/[4/3]`, `translate-y-1`,
  `w-[360px]`, `md:w-1/2`, `h-[40vw]`. Brace-expand where possible.
- Move the existing custom body/scrollbar rules and any svelte-select overrides (currently in
  `src/app.css`) into `@layer base { … }`.
- The `@utility bump` / `@utility negative-bump` pattern from the starter matches the config's
  `translate-y-1` intent — adopt it.

Verify: `pnpm vite:dev` compiles CSS clean; scroll a few pages; `pnpm build` should now get
further (it'll still fail on Svelte 4 syntax until Commit 3).

### Commit 3 — codemod (RUN THIS YOURSELF, interactive)

```bash
cd ~/Documents/GitHub/data-dynamiq && npx sv migrate svelte-5
```

Prompts: `Continue?` → **Yes** · folders → Enter (all) · `convert components?` → **Yes**.
Commit the **raw** output untouched (clean diff for Commit 4). Expect `export let`→`$props()`,
`on:`→`onclick`/etc., `<slot/>`→`{@render children?.()}`, and `<!-- @migration-task -->`
comments on the `$$props.class` files.

### Commit 4 — hand-clean codemod output

`grep -rl '@migration-task' src/` and fix each (the `$$props.class || ''` → `interface Props`
+ `class: klass` idiom). Also: promote `run(() => …)` from `svelte/legacy` to `$derived`/`$effect`,
tighten `$state()` types (SSR-safe initials), `ComponentProps<typeof X>`, restore dropped slot
fallbacks (`{#if children}{@render children()}{:else}…{/if}`). Target: `pnpm check` errors drop
to just the deferred library-swap ones.

### Commit 5 — library swaps

- **svelte-gestures ^4 → ^5.2.2**: bump the dep, create `src/lib/utils/swipeAction.ts`
  (`createSwipeAction` per the skill), and convert all 10 `use:swipe` sites to the v5 API.
  This is behavioural — flag the sliders for hands-on mobile review.
- **FontAwesome → Lucide** (`@lucide/svelte`): swap the 3 CDN `<i class="fa-…">` files, drop
  the Kit `<script>` from `src/app.html`, and remove the `@fortawesome/*` deps (verify they're
  unused first). Mind the FA-vs-Lucide vertical-offset gotcha (drop `absolute`, let flexbox center).
- Re-check **svelte-select 5.8.3** under Svelte 5 (the skill's scratch compile test said it's fine).
- `pnpm install`; `rm -rf node_modules/@fortawesome` if stale dirs persist.

### Commit 6 — `pnpm format` (separate commit), then `pnpm lint` fixups

`NodeJS.Timeout`→`ReturnType<typeof setInterval>`, kill `any`, strip irregular whitespace from
CMS copy, drop dead imports. Target `pnpm check` → **0 errors**.

### Commit 7 — `docs/UPGRADE_NOTES.md`

Final stack table + per-commit summary + gotchas actually hit. (Prototype:
`~/Documents/GitHub/medical-solutions-of-texas/docs/UPGRADE_NOTES.md`.) Then delete this handoff file.

## After the migration: onboard + self-updating (fleet wiring)

Once `pnpm check` is clean and `pnpm build` succeeds:

1. **Onboard to `@reddoorla/maintenance`** — add it + the audit/test deps the CI gate needs
   (`@axe-core/playwright`, `@playwright/test`, `vitest`, `jsdom`, `@reddoorla/maintenance@^0.28.0`;
   `@lhci/cli`, `@testing-library/svelte`, `globals`/`@eslint/js`/`typescript-eslint` already added).
   Run the `onboard` recipe via the local dist CLI:
   `node ~/Documents/GitHub/reddoor-maintenance/dist/cli/bin.js onboard --cwd ~/Documents/GitHub/data-dynamiq`.
2. **a11y fixtures** — this repo has **no `/dev/a11y-fixtures` or `/dev/animate-in`** routes; the
   a11y audit gate needs both (see the stale-repo playbook gotcha: missing `/dev/animate-in` 404s
   with an empty `<title>` → axe `document-title` fail). Add the canonical fixtures pages + ensure
   the layout has a `<title>` fallback. Note the body is **black** (`app.html` inline style) — style
   the fixtures `<main>` with light text and add a minimal `+error.svelte` (dark-theme gotcha).
   Drop `user-scalable=no` if present (data-dynamiq's viewport is currently just `width=device-width`
   — fine).
3. **`sync-configs`** for `.prettierignore`/`.github` thin-shim CI/`renovate.json`/`renovate.yml`.
4. **`self-updating`** — but note: it only writes CI files if they're **missing**, and it will set
   branch protection to **`ci / ci`**. Because the thin-shim templates ship in 0.28.0, a fresh repo
   gets the correct caller. After the PR's `ci / ci` check goes green, `PUT` branch protection to
   `["ci / ci"]` and enable repo auto-merge (the org fine-grained PAT can't open PRs on `reddoorla/*`
   — open the PR with `gh`).
5. Set the `RENOVATE_TOKEN` repo secret (self-updating does this if a token is configured).

## Boot/verify one-liners

```bash
pnpm install && pnpm exec svelte-kit sync
pnpm exec vite dev --port 5199   # then: curl -s -o /dev/null -w '%{http_code}\n' localhost:5199/
# full CI mirror (after Commit 6): pnpm lint && pnpm check && pnpm build && \
#   pnpm exec reddoor-maint audit --only a11y --fail-on-violations
```
