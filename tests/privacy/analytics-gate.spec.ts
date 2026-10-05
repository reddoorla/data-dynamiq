import { test, expect, type Page } from "@playwright/test";

const MEASUREMENT_ID = "G-V11LZYNMY2";

async function serveAs(page: Page, origin: string, baseURL: string): Promise<void> {
  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: new URL(url.pathname + url.search, baseURL).href });
    await route.fulfill({ response });
  });
}

async function recordGtag(page: Page): Promise<string[]> {
  const seen: string[] = [];
  await page.route(/googletagmanager\.com|google-analytics\.com/, async (route) => {
    seen.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  return seen;
}

async function tagState(page: Page) {
  return page.evaluate(() => ({
    scripts: [...document.querySelectorAll("script[data-reddoor-analytics]")].map(
      (s) => (s as HTMLScriptElement).src,
    ),
    dataLayer: "dataLayer" in window,
  }));
}

test.describe("the GA4 tag's production-host gate", () => {
  test("loads gtag for this property on www.datadynamiq.com", async ({ page, baseURL }) => {
    const seen = await recordGtag(page);
    await serveAs(page, "https://www.datadynamiq.com", baseURL!);
    await page.goto("https://www.datadynamiq.com/privacy", { waitUntil: "domcontentloaded" });
    await expect
      .poll(() => seen.some((u) => u.includes(`/gtag/js?id=${MEASUREMENT_ID}`)))
      .toBe(true);
    expect((await tagState(page)).dataLayer).toBe(true);
  });

  test("loads it on the apex twin, datadynamiq.com", async ({ page, baseURL }) => {
    const seen = await recordGtag(page);
    await serveAs(page, "https://datadynamiq.com", baseURL!);
    await page.goto("https://datadynamiq.com/privacy", { waitUntil: "domcontentloaded" });
    await expect
      .poll(() => seen.some((u) => u.includes(`/gtag/js?id=${MEASUREMENT_ID}`)))
      .toBe(true);
  });

  for (const origin of [
    "https://deploy-preview-1--data-dynamiq.netlify.app",
    "https://data-dynamiq.netlify.app",
    "https://staging.datadynamiq.com",
  ]) {
    test(`stays inert on ${new URL(origin).hostname}`, async ({ page, baseURL }) => {
      const seen = await recordGtag(page);
      await serveAs(page, origin, baseURL!);
      await page.goto(`${origin}/privacy`, { waitUntil: "networkidle" });
      await expect(page.getByTestId("service-ga4")).toBeVisible();
      expect(seen).toEqual([]);
      expect(await tagState(page)).toEqual({ scripts: [], dataLayer: false });
    });
  }

  test("stays inert on the dev server's localhost", async ({ page }) => {
    const seen = await recordGtag(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("footer")).toBeVisible();
    expect(seen).toEqual([]);
    expect(await tagState(page)).toEqual({ scripts: [], dataLayer: false });
  });
});
