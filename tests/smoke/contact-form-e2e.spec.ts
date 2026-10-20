import { test, expect, type Page } from "@playwright/test";

// The fleet's nightly form-e2e probe enters at /contact, needs a <form> in the
// DOM at domcontentloaded, waits for html[data-hydrated], injects a hidden
// `testMode=true` input into the first <form>, fills it, clicks the first
// button[type="submit"], and waits for [role="status"]. Central ingest drops a
// payload carrying `testMode` instead of emailing the client. The form here
// lives in a modal on `/`, so /contact → /#contact must open it. /api/contact is
// intercepted: no submission leaves the browser.

// The first navigation can meet a cold dev server that compiles for well over
// the default 30 s before it hydrates.
test.describe.configure({ timeout: 90_000 });

type Posted = Record<string, unknown>;

async function interceptContact(page: Page): Promise<Posted[]> {
  const posted: Posted[] = [];
  await page.route("**/api/contact", async (route) => {
    posted.push(route.request().postDataJSON() as Posted);
    await route.fulfill({ json: { ok: true } });
  });
  return posted;
}

async function fillAndSubmit(page: Page, { probe }: { probe: boolean }) {
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
  await form.locator('[name="message"]').fill("Smoke test, please ignore.");
  await page.locator('button[type="submit"], input[type="submit"]').first().click();
}

test("the contact form is in the server-rendered DOM, closed", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("form").first().locator('input[name="email"]')).toBeAttached();
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await expect(page.locator("form").first()).toBeHidden();
});

test("/contact opens the contact modal", async ({ page }) => {
  await page.goto("/contact");
  expect(new URL(page.url()).hash).toBe("#contact");
  await expect(page.locator("form").first()).toBeVisible();
});

test("a probe submission forwards testMode and shows role=status", async ({ page }) => {
  const posted = await interceptContact(page);
  await page.goto("/contact");
  await fillAndSubmit(page, { probe: true });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  expect(posted).toHaveLength(1);
  expect(posted[0].testMode).toBe("true");
});

test("a visitor submission carries no testMode", async ({ page }) => {
  const posted = await interceptContact(page);
  await page.goto("/");
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await page.getByRole("button", { name: "Contact Us" }).first().click();
  await fillAndSubmit(page, { probe: false });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  expect(posted).toHaveLength(1);
  expect(posted[0]).not.toHaveProperty("testMode");
});
