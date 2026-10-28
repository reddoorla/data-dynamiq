import { test, expect } from "@playwright/test";

// The fleet's nightly browser audit (reddoor-maintenance src/audits/browser.ts,
// `titleMetaOk`) fails a site when any sampled route has an empty <title> or
// meta description, or when two routes share a title. This pins the same three
// rules over the site's own pages. The gallery routes in tests/smoke/routes.ts
// are the scaffold's component demos, which the audit never samples, so they
// are not listed here; a real page added to the site belongs in this list.
const sitePages = ["/", "/privacy"];

async function readHead(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  return page.evaluate(() => ({
    title: document.title.trim(),
    description: (
      document.head.querySelector('meta[name="description"]')?.getAttribute("content") ?? ""
    ).trim(),
  }));
}

for (const path of sitePages) {
  test(`${path} has a title and a meta description`, async ({ page }) => {
    const { title, description } = await readHead(page, path);
    expect(title, `${path}: empty title`).not.toBe("");
    expect(description, `${path}: missing meta description`).not.toBe("");
  });
}

test("no two site pages share a title", async ({ page }) => {
  const byTitle = new Map<string, string[]>();
  for (const path of sitePages) {
    const { title } = await readHead(page, path);
    if (title) byTitle.set(title, [...(byTitle.get(title) ?? []), path]);
  }
  const dupes = [...byTitle].filter(([, paths]) => paths.length > 1);
  expect(dupes, `duplicate titles: ${JSON.stringify(dupes)}`).toEqual([]);
});
