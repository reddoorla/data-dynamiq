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
