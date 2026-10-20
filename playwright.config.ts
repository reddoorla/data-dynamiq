import { defineConfig } from "@playwright/test";
import base from "@reddoorla/maintenance/configs/playwright-a11y";
import { useIngestCapture } from "./tests/smoke/ingest-capture";

// The smoke suite submits the real contact form; its ingest call goes to a local
// capture server, never to the central endpoint (tests/smoke/ingest-capture.ts).
useIngestCapture();

// Emulate reduced motion in tests: instant scrollIntoView (no long animated
// smooth-scroll that flakes Playwright's actionability checks under parallel
// load) and view transitions fall back to instant. Pairs with the
// prefers-reduced-motion gate on scroll-behavior in src/app.css.
//
// R1.1 (health-gate): the central `smoke` audit (reddoor-maintenance
// src/audits/smoke.ts) allocates a free port and passes it as
// REDDOOR_SMOKE_PORT so a zombie vite already squatting the default 5173 can't
// silently hijack the run and green a stale build. When it's set, bind vite to
// exactly that port with --strictPort (forwarded through `npm run vite:dev` so
// it stays portable across pnpm/npm) and aim Playwright's baseURL + readiness
// probe at it. Unset (local `pnpm test:smoke`) → the shared base's fixed 5173.
const smokePort = process.env.REDDOOR_SMOKE_PORT;

export default defineConfig({
  ...base,
  globalSetup: "./tests/smoke/ingest-capture.ts",
  use: {
    ...base.use,
    reducedMotion: "reduce",
    ...(smokePort ? { baseURL: `http://localhost:${smokePort}` } : {}),
  },
  ...(smokePort
    ? {
        webServer: {
          command: `npm run vite:dev -- --port ${smokePort} --strictPort`,
          url: `http://localhost:${smokePort}/dev/a11y-fixtures`,
          // Never reuse (the shared base's rule, #524): a reused dev server has its
          // own FORMS_INGEST_URL, and the contact spec submits a visitor form.
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }
    : {}),
});
