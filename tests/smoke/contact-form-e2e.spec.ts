import { test, expect, type Page } from "@playwright/test";
import { attemptMarker, capturedWith } from "./ingest-capture";

// The fleet's nightly form-e2e probe enters at /contact, needs a <form> in the
// DOM at domcontentloaded, waits for html[data-hydrated], injects a hidden
// `testMode=true` input into the first <form>, fills it, clicks the first
// button[type="submit"], and waits for [role="status"]. Central ingest drops a
// payload carrying `testMode` instead of emailing the client. The form here
// lives in a modal on `/`, so /contact → /#contact must open it. The ingest body
// lands on the local capture server (playwright.config.ts), so nothing leaves
// the machine.

// The first navigation can meet a cold dev server that compiles for well over
// the default 30 s before it hydrates.
test.describe.configure({ timeout: 90_000 });

async function fillAndSubmit(page: Page, marker: string, { probe }: { probe: boolean }) {
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  const form = page.locator("form").first();
  if (probe) {
    await form.evaluate((f) => {
      const el = document.createElement("input");
      el.type = "hidden";
      el.name = "testMode";
      el.value = "true";
      f.appendChild(el);
    });
  }
  await form.locator('[name="name"]').fill("Reddoor Monitor");
  await form.locator('[name="email"]').fill("monitor+e2e@reddoorla.com");
  await form.locator('[name="message"]').fill(marker);
  await page.locator('button[type="submit"], input[type="submit"]').first().click();
}

test("the contact form is in the server-rendered DOM, closed", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("form").first().locator('input[name="email"]')).toBeAttached();
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await expect(page.locator("form").first()).toBeHidden();
});

test("/contact 301s to /#contact, which opens the contact modal", async ({ page, request }) => {
  const res = await request.get("/contact?utm_source=x", { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers().location).toBe("/?utm_source=x#contact");
  await page.goto("/contact");
  await expect(page.locator("form").first()).toBeVisible();
  // The opener drops the hash once it has done its job, so a reload stays closed.
  await expect.poll(() => new URL(page.url()).hash).toBe("");
});

test("a probe submission reaches ingest marked testMode, and shows role=status", async ({
  page,
}, info) => {
  const marker = attemptMarker("probe", info);
  await page.goto("/contact");
  await fillAndSubmit(page, marker, { probe: true });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  const bodies = await capturedWith(marker);
  expect(bodies).toHaveLength(1);
  expect(bodies[0].testMode).toBe(true);
});

test("a visitor submission reaches ingest without testMode", async ({ page }, info) => {
  const marker = attemptMarker("visitor", info);
  await page.goto("/");
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await page.getByRole("button", { name: "Contact Us", exact: true }).first().click();
  await fillAndSubmit(page, marker, { probe: false });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  const bodies = await capturedWith(marker);
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).not.toHaveProperty("testMode");
});

test("/health declares forms.testMode, which lets the fleet probe submit", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBe(true);
  expect((await res.json()).forms.testMode).toBe(true);
});
