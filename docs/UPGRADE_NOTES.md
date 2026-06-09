# data-dynamiq — Svelte 4 → 5 upgrade + reddoor onboarding notes

Migration of `data-dynamiq` (a Prismic/SvelteKit site, formerly named
`sveltekit-starter-prismic-minimal`) from the legacy stack onto the reddoor-starter
stack, following the `svelte4-to-5-upgrade` skill. Canonical reference shape:
`~/Documents/GitHub/reddoor-starter/`.

## Stack: before → after

| Area               | Before                             | After                                                                 |
| ------------------ | ---------------------------------- | --------------------------------------------------------------------- |
| Svelte             | 4.2.8                              | 5.55+                                                                 |
| Kit                | 2.0                                | 2.61+                                                                 |
| Vite               | 5.0                                | 8.0                                                                   |
| vite-plugin-svelte | 3.0                                | 7.1                                                                   |
| svelte-check       | 3.6                                | 4.4                                                                   |
| Tailwind           | 3.4 (`tailwind.config.js`)         | 4.3 (`@import` + `@theme`, no config)                                 |
| ESLint             | 8 (`.eslintrc`)                    | 10 (flat `eslint.config.js`)                                          |
| Adapter            | `adapter-auto`                     | `adapter-netlify` (edge:false, split:false)                           |
| Package mgr        | npm                                | pnpm 10.33                                                            |
| Config             | jsconfig.json                      | tsconfig.json (bundler, strict)                                       |
| TS gestures        | svelte-gestures 4 (`swipe` action) | svelte-gestures 5 (`useSwipe` hook, `$utils/swipeAction`)             |
| Prismic            | @prismicio/svelte 1                | @prismicio/svelte 2                                                   |
| Icons              | FontAwesome (CDN kit + npm)        | @lucide/svelte (non-brand); **FA brands still on SocialsRow/TeamBox** |

## Commit-by-commit

1. **Stack bump** — deps + configs only, no `.svelte` edits (Svelte 5 ran the v4
   components in legacy mode). pnpm conversion, `.gitignore` adopted from starter,
   untracked the committed `.svelte-kit/` + `.DS_Store`.
2. **Tailwind 4 CSS** — `src/app.css` → `@import "tailwindcss"` + `@theme`; `safelist`
   → `@source inline`; `.bump`/`.negative-bump` → `@utility`; deleted `tailwind.config.js`.
3. **Codemod** — raw `npx sv migrate svelte-5` output (interactive, run by hand).
4. **Hand-clean** — 16 `@migration-task` files (`$$props.class` → `class: klass`,
   `<slot>` → `{@render children?.()}`, etc.); `$state()` type tightening;
   `ComponentProps<typeof X>`; slice-simulator typing.
   5a. **svelte-gestures v4 → v5** — `$utils/swipeAction.ts` wraps `useSwipe`; all 10
   `use:swipe` sites swapped; carousel params (`minSwipeDistance:20`, `touchAction:pan-y`)
   preserved through the wrapper.
   5b. **FontAwesome → Lucide** (non-brand) — Mail/MapPin/Phone/X/Menu/Search; dropped the
   FA Kit CDN `<script>`; pruned unused FA deps.
   6a. **Format** — `pnpm format` (whitespace only).
   6b. **Lint** — eslint 0 errors (dead-code removal, `NodeJS.Timeout` → `ReturnType<…>`,
   `any` → concrete types).

**End state: `prettier --check`, `eslint`, `svelte-check` (0 errors), and `pnpm build`
all pass.** 48 svelte-check warnings (a11y / `state_referenced_locally` / quoted-attr)
are left for a follow-up.

## Gotchas actually hit (data-dynamiq specifics)

- **svelte-gestures had to stay at v4 until after the codemod** — v5 removed the `{ swipe }`
  export, which 500'd the homepage. Bumped + swapped in Commit 5a, not Commit 1.
- **@prismicio/svelte v1 → v2 was safe to bump in Commit 1** (v2 loads under Svelte 5 legacy
  mode) — no need to stage it.
- **`ComponentProps<X>` needs `typeof`** (gotcha #9) — the two `Slider*` wrappers' broken
  `ComponentProps<ContentBox>` cascaded into `never[]`/spread errors (and the `plans` route
  array error); `ComponentProps<typeof ContentBox>` fixed all of it.
- **`tailwind.config.js` was buggy** — the `height` block was duplicated ~5× with bogus
  `512`/`640`/`proportion` entries; fixed in transit. Custom heights turned out unused in markup.
- **A dead no-op `classContent` prop** on a `<ScreenWidthImage>` caller (Svelte 4 silently
  ignored unknown props; Svelte 5 errors) — removed.
- **`pnpm build` server-renders the Prismic routes** (no prerender), so it succeeds without a
  live Prismic connection.

## Remaining work (NOT done)

1. **FontAwesome brand icons — visual decision.** `SocialsRow.svelte` and `TeamBox.svelte`
   still use `@fortawesome/free-brands-svg-icons` (Facebook / Twitter / Reddit / Instagram /
   LinkedIn). Lucide 1.17 ships none of these, so they need hand-rolled inline SVGs (source
   from simple-icons), AND a **Twitter-vs-X** brand call. Until then, keep
   `@fortawesome/svelte-fontawesome` + `@fortawesome/free-brands-svg-icons`. Both components
   are used (footers + teams routes), so they can't be deleted like the reference migration did.
   Mind the FA-baseline vs Lucide-top-left vertical-offset gotcha on any swap.
2. **Fleet onboarding / self-updating wiring.** To bring data-dynamiq into the self-updating
   fleet (the original goal):
   - Add `@reddoorla/maintenance@^0.28.0` + the audit/test deps the reusable CI gate runs
     (`@axe-core/playwright`, `@playwright/test`, `vitest`, `jsdom`; `@lhci/cli`,
     `@testing-library/svelte`). Run the `onboard` recipe via the local dist CLI:
     `node ~/Documents/GitHub/reddoor-maintenance/dist/cli/bin.js onboard --cwd ~/Documents/GitHub/data-dynamiq`.
   - **Add the missing `/dev/a11y-fixtures` + `/dev/animate-in` routes** — the CI a11y audit
     needs both (stale-repo gotcha: missing `/dev/animate-in` 404s with an empty `<title>` →
     axe `document-title` fail). Body is **black** (`app.html`), so style the fixtures `<main>`
     light and add a minimal `+error.svelte`. The a11y audit may surface real violations from
     the 48 current warnings (the `aria-hidden` empties on the slider dots are the likely ones).
   - `sync-configs` (thin-shim CI `.github/workflows/ci.yml` caller + `renovate.json` +
     `renovate.yml`), then `self-updating` → `ci / ci` branch protection + `RENOVATE_TOKEN`.
     Open the PR with `gh` (the org fine-grained PAT can't open PRs on `reddoorla/*`); after
     `ci / ci` is green, PUT branch protection `["ci / ci"]` and enable repo auto-merge.

## Verify one-liners

```bash
pnpm install && pnpm exec svelte-kit sync
pnpm lint && pnpm check && pnpm build      # all green as of Commit 6b
pnpm exec vite dev --port 5199             # GET / -> 200
```

Reference: `~/Documents/GitHub/medical-solutions-of-texas/docs/UPGRADE_NOTES.md` (prototype),
`~/Documents/GitHub/reddoor-starter/` (canonical end-state).
