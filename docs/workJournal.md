# Data Dynamiq — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom.
[UPGRADE_NOTES.md](UPGRADE_NOTES.md) records the 2026 migration onto the
reddoor stack; this is the ongoing history.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, and 51 commits summarised rather than reconstructed (`chore/work-journal`)

The journal starts today, so this first entry is a **backfill**: a coarse
summary read off the commit log, not written from memory. Detail below this
line is contemporaneous; detail above it is not, and nothing here should be
cited as though someone wrote it down at the time. For anything before
2026-09-05 the commit log and `docs/UPGRADE_NOTES.md` remain the record.

**What this repo is.** The Data Dynamiq site — SvelteKit + Prismic on Netlify,
forked from Reddoor's pre-starter wireframer scaffold (`README.md` is still the
wireframer's, and `slicemachine.config.json` still names the
`reddoor-wireframer` Prismic repository). That scaffold's gallery routes —
`/navs`, `/footers`, `/sliders`, `/teams` and a dozen more — are still in the
tree beside the real site. The homepage is hand-built in
`src/routes/[[preview=preview]]/+page.svelte`; Prismic drives `[uid]`, and
there is exactly one slice, `RichText`.

**Two eras, a year of silence between them.** 26 commits in September 2024 are
the original build, in messages like "sizing", "still not right" and "fix
fetch?" — the contact form, Turnstile, and mobile behaviour of the slider and
the contact box. Then one commit in September 2025 (robots.txt). Then 24
commits across June and July 2026, all of them fleet onboarding under PR
numbers: the Svelte 4→5 / Tailwind 4 / pnpm migration (#1, written up in
`docs/UPGRADE_NOTES.md`), a homepage hydration crash from `$state` declared
after the `run()` that used it (#2), contact routed to the dashboard ingest
(#5, #6), Cloudflare Turnstile (#18), `/health` (#21), the smoke suite (#22,
#26), og:image actually rendered for scrapers (#20), a real 404 and a semantic
`<footer>` (#23).

**One thing already stale.** `docs/UPGRADE_NOTES.md` lists "FontAwesome brand
icons" as remaining work, blocked on a Twitter-vs-X call. It is not remaining:
`SocialsRow` and `TeamBox` render a local `BrandIcon`, and neither `src/` nor
`package.json` mentions FontAwesome. The swap landed inside the very PR those
notes describe, and the notes were never revised — the failure mode this
journal exists to replace: a document that stops being true with no dated
successor saying so.

**Where the checkout stands.** Branch `ci/wire-smoke-tests` at `32e1367`, tree
clean, but stale: that branch's upstream is gone (squash-merged as #26 on
2026-07-16) and the checkout is 18 commits behind `origin/main` (`9ce17b7`,
2026-09-02), which is Renovate bumps and CI wiring. Nothing is in flight
locally. This entry's branch is cut from `ci/wire-smoke-tests`, so its PR
carries those three already-merged files alongside the two new ones.

## 2026-10-04 — Off Slice Machine, onto the Prismic CLI (reddoor-maintenance#1090, `claude/prismic-cli`)

Phase 4 of the fleet migration (reddoor-maintenance
`docs/prismic-migration-plan-2026-10.md` §9), following espada's and
caltex-landing's ports of reddoor-starter#166. Slice Machine is deprecated by
Prismic since 2026-09-18; the generated files now come from `pnpm prismic:gen`.
This site is **code only**: its Prismic repository, `reddoor-wireframer`, is
Reddoor's shared wireframe repository, used by other projects, so there is no
Prismic-side switch to the Type Builder for it and no operator step after
merge.

**The simulator could not be framed in production, for caltex's reason.** No
CSP is configured (svelte.config.js does not set `kit.csp`, whatever
netlify.toml's comment says) and there was no hook, but the root layout's
`prerender = "auto"` crawled `/slice-simulator` into a static file, and
netlify.toml's `/*` block sends `X-Frame-Options: SAMEORIGIN` on static files.
Measured on www.datadynamiq.com before the change: `/` and `/slice-simulator`
carried `SAMEORIGIN` from the edge cache; `/health` (a function) carried none.
From `vite preview` on `origin/main`, `/slice-simulator`, `/`, `/navs` and
`/health` sent neither header, which is why a local check would never have
shown it. `/slice-simulator` is now `prerender = false` and a hook touching only
that route drops X-Frame-Options and sends
`frame-ancestors 'self' http://localhost:* https://*.prismic.io https://prismic.io`.
Prerendered pages went from 19 to 18; `/`, `/navs`, `/health` and a 404 uid
send neither header after. Putting `prerender` back to `"auto"` returns
`slice-simulator.html` to the build; disabling the hook's branch removes the
CSP from the route.

**Types moved to the project root, and svelte-check stopped seeing them:** 0
errors on `origin/main`, 2 without the `src/app.d.ts` import (`Content` gone
from RichText, `[uid]`'s `entries()` uid widened to `string | null`), 0 with it.

**A stale model, found by regenerating.** The new types add
`FormRepliesDocument` and `FormRepliesDocumentDataRepliesItem`:
`customtypes/form_replies` arrived with the fleet form work and the committed
Slice Machine types were never regenerated after it. The slice index maps the
same one component. `src/lib/server/reply-copy.ts` still says `form_replies` is
absent from the generated union; that is no longer true of the types, and the
`as never` casts it describes still compile, so it was left alone.

**Sync with Prismic is unproven, not proven.** The nightly drift sweep skips
this repo by design: `reddoor-wireframer` is in the maintenance package's
placeholder list, so the sweep reports it as "not a Prismic site (no
repositoryName)". The Prismic connector refuses the repository ("Prismic MCP is
not activated"), so no model-level comparison was possible. The public Content
API lists one custom type, `page`, and two published `page` documents (one with
`rich_text`/`default`/`content`), consistent with the local `page` and
`RichText` models; it does not list `form_replies`. Nothing here writes to
Prismic, so none of that blocks a code-only change.

## 2026-10-04 — The simulator leaves the `[uid]` bundle; an encoded path gets the simulator's framing (`fix/simulator-chunk-and-encoded-framing`)

Ported from reddoor-starter#168, following caltex-landing#70; the starter's entry records the bundle fixes that failed before this one. `/slice-simulator` imports `SliceSimulator` from the `@prismicio/svelte` barrel, which re-exports it statically, so Rolldown put the simulator into the barrel's shared chunk, and `[uid]`, which renders a `SliceZone`, loaded it. `scripts/prismic-barrel.ts`, identical to the starter's, declares that re-export-only module side-effect-free, and `SliceZone` is then bound directly.

Measured from the build manifest as each client node's static-import closure, gzipped, `main` → branch: `[uid]` went 33,053 → 28,661 and no longer reaches the simulator chunk. `/slice-simulator` went 33,122 → 33,284 and now carries the code in its own node. Unlike caltex, the root layout (38,534 → 38,536) and the hand-built home (48,039 → 48,038) never reached it, so the win here is every Prismic-driven page and nothing else.

The hook asked `isCmsFramedRoute(event.url.pathname)`, the raw path, while SvelteKit routes on the decoded one. From `vite preview` of `main`, `/slice%2Dsimulator` and `/slice%2dsimulator` rendered the simulator with a 200 and no CSP at all. The hook now asks `event.route.id`, and both encoded paths answer with the same widened `frame-ancestors` as `/slice-simulator`.

`vite.config.ts` imports the plugin without an extension: this tsconfig does not set `allowImportingTsExtensions`, which the starter's `.ts` import relies on. There are no unit tests here, so the proof is `tests/smoke/slice-simulator.spec.ts`, copied from caltex. On `main` it failed 3 of 7 (the bundle check on node 4 and both encoded paths); on the branch it passes 7 of 7; with the plugin removed and the site rebuilt, the bundle check fails on node 4 again. A previous run of this port was cut off by a container restart with the plugin imported but never registered in `plugins`, a state in which every check here except the bundle test would have passed. This is a code-only change; nothing was written to the shared `reddoor-wireframer` repository.
