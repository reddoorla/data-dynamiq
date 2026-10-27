import { test, expect, type Locator } from "@playwright/test";

/**
 * WCAG contrast of an element's text against the ground it is actually drawn on.
 * The footer sits on a photo, which no computed background-color can see, so
 * this hides the element's own text, screenshots its box and scores the text
 * colour against the lighter tenth of those pixels (the 90th-percentile
 * luminance): a bright patch behind the words counts, a stray highlight does not.
 */
async function contrastAgainstGround(el: Locator): Promise<number> {
  // The ground is only there once its image has loaded.
  await el.page().waitForLoadState("load");
  await el.scrollIntoViewIfNeeded();
  const color = await el.evaluate((node) => {
    const color = getComputedStyle(node).color;
    (node as HTMLElement).style.setProperty("color", "transparent", "important");
    (node as HTMLElement).style.setProperty("text-decoration-color", "transparent", "important");
    return color;
  });
  const shot = await el.screenshot({ animations: "disabled" });
  await el.evaluate((node) => {
    (node as HTMLElement).style.removeProperty("color");
    (node as HTMLElement).style.removeProperty("text-decoration-color");
  });
  // Decode on a blank page, out of reach of the site's CSP.
  const blank = await el.page().context().newPage();
  try {
    return await blank.evaluate(
      async ([b64, color]) => {
        const lum = (r: number, g: number, b: number) => {
          const ch = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
        };
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, img.width, img.height).data;
        const ground: number[] = [];
        for (let i = 0; i < px.length; i += 4) ground.push(lum(px[i], px[i + 1], px[i + 2]));
        ground.sort((a, b) => a - b);
        const bg = ground[Math.floor(ground.length * 0.9)];
        const [r, g, b] = (color.match(/[\d.]+/g) ?? []).map(Number);
        const fg = lum(r, g, b);
        const [hi, lo] = [fg, bg].sort((a, b) => b - a);
        return (hi + 0.05) / (lo + 0.05);
      },
      [shot.toString("base64"), color] as const,
    );
  } finally {
    await blank.close();
  }
}

test.describe("/privacy", () => {
  test("renders the DRAFT policy, noindex, with this site's services", async ({ page }) => {
    const response = await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Privacy Policy");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.getByTestId("privacy-draft")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
    for (const id of ["forms", "ga4", "vimeo", "googleFonts", "netlify"]) {
      await expect(page.getByTestId(`service-${id}`)).toBeVisible();
    }
    for (const id of ["newsletter", "youtube", "adobeFonts"]) {
      await expect(page.getByTestId(`service-${id}`)).toHaveCount(0);
    }
    await expect(page.getByTestId("privacy-dnt")).toBeVisible();
  });

  test("names the business, the effective date and the contact email", async ({ page }) => {
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    const text = await page.locator("article").innerText();
    expect(text).toContain('Data Dynamiq ("we") runs this website');
    expect(text).toContain("Effective October 6, 2026");
    expect(text).not.toContain("[client legal name]");
    expect(text).not.toContain("[privacy contact email]");
    await expect(
      page.locator('article a[href="mailto:robbie.greenquist@gmail.com"]').first(),
    ).toBeVisible();
  });

  test("is the only page that asks not to be indexed", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
});

test.describe("third parties a page contacts", () => {
  test("/ and /privacy make no request to vimeo.com", async ({ page }) => {
    const vimeo: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("vimeo.com")) vimeo.push(r.url());
    });
    for (const path of ["/", "/privacy"]) {
      await page.goto(path, { waitUntil: "networkidle" });
    }
    expect(vimeo).toEqual([]);
  });
});

test.describe("links to /privacy", () => {
  test("the home footer links to the policy", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    const link = page.locator('footer a[href="/privacy"]');
    expect(await contrastAgainstGround(link)).toBeGreaterThanOrEqual(4.5);
  });

  test("the contact dialog shows the notice as soon as it opens, without scrolling", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: /contact us/i })
      .first()
      .click();
    const form = page.locator("form").filter({ has: page.locator('textarea[name="message"]') });
    await expect(form).toBeVisible();
    const notice = page.getByTestId("privacy-notice");
    await expect(notice).toHaveCount(1);
    await expect(notice).toBeInViewport({ ratio: 1 });
    await expect(notice.locator('a[href="/privacy"]')).toBeVisible();
    expect(
      await contrastAgainstGround(notice.locator('a[href="/privacy"]')),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
