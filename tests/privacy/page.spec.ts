import { test, expect, type Locator } from "@playwright/test";

/**
 * WCAG contrast of an element's text against the ground it is actually drawn on.
 *
 * The text colour is resolved, not estimated from glyphs: the computed `color`
 * (or, when the fill is fully transparent, the `-webkit-text-stroke` colour) is
 * parsed by a canvas, so any syntax the browser accepts (rgba, Tailwind v4's
 * oklch) works, and its alpha is multiplied by the `opacity` of the element and
 * every ancestor. Antialiasing, font weight and devicePixelRatio stay out of it.
 *
 * The ground is measured, because the footer sits on a photo no computed
 * background-color can see: the element's box is screenshotted with its text
 * hidden (fill, stroke, shadow and decoration transparent). The text is
 * composited over each ground pixel and scored against it, and the verdict is
 * the worst tenth of those pixels, so a patch of ground in the text's own
 * polarity counts whichever way the text leans, and a stray pixel does not.
 *
 * It throws, naming the element and its colours, when the text paints nothing,
 * when no colour can be resolved, or when the ground moves between shots; it
 * never returns NaN.
 */
async function contrastAgainstGround(el: Locator, name: string): Promise<number> {
  // The ground is only there once its image has loaded.
  await el.page().waitForLoadState("load");
  await el.scrollIntoViewIfNeeded();
  const shot = () => el.screenshot({ animations: "disabled" });
  const hide: Record<string, string> = {
    color: "transparent",
    "-webkit-text-stroke-color": "transparent",
    "text-decoration-color": "transparent",
    "text-shadow": "none",
  };
  const shown = await shot();
  const paint = await el.evaluate((node, hide) => {
    const style = getComputedStyle(node);
    let opacity = 1;
    for (let n: Element | null = node; n; n = n.parentElement) {
      opacity *= Number(getComputedStyle(n).opacity);
    }
    const paint = {
      fill: style.color,
      stroke: style.getPropertyValue("-webkit-text-stroke-color"),
      strokeWidth: parseFloat(style.getPropertyValue("-webkit-text-stroke-width")) || 0,
      opacity,
    };
    for (const [prop, value] of Object.entries(hide)) {
      (node as HTMLElement).style.setProperty(prop, value, "important");
    }
    return paint;
  }, hide);
  const hidden = await shot();
  await el.evaluate((node, props) => {
    for (const prop of props) (node as HTMLElement).style.removeProperty(prop);
  }, Object.keys(hide));
  const again = await shot();
  const what = `${name} (color ${paint.fill}, stroke ${paint.strokeWidth}px ${paint.stroke}, opacity ${paint.opacity})`;
  // Decode on a blank page, out of reach of the site's CSP.
  const blank = await el.page().context().newPage();
  let measured: { ok: true; ratio: number } | { ok: false; why: string };
  try {
    measured = await blank.evaluate(
      async ({ shots, paint }) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        const pixelsOf = async (b64: string) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          return ctx.getImageData(0, 0, img.width, img.height).data;
        };
        const [text, plain, text2] = [
          await pixelsOf(shots[0]),
          await pixelsOf(shots[1]),
          await pixelsOf(shots[2]),
        ];
        if (text.length !== plain.length || text.length !== text2.length) {
          return { ok: false as const, why: "its box changed size between the screenshots" };
        }
        let changed = 0;
        for (let i = 0; i < text.length; i += 4) {
          if (
            text[i] !== text2[i] ||
            text[i + 1] !== text2[i + 1] ||
            text[i + 2] !== text2[i + 2]
          ) {
            return { ok: false as const, why: "its ground moved between the screenshots" };
          }
          if (
            text[i] !== plain[i] ||
            text[i + 1] !== plain[i + 1] ||
            text[i + 2] !== plain[i + 2]
          ) {
            changed++;
          }
        }
        if (changed === 0) return { ok: false as const, why: "its text changes no pixel" };
        // A colour string to straight RGBA, through the canvas parser.
        const rgba = (css: string) => {
          canvas.width = canvas.height = 1;
          const probe = (sentinel: string) => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = sentinel;
            ctx.fillStyle = css;
            return ctx.fillStyle;
          };
          // An unparseable string leaves fillStyle at whichever sentinel was set.
          if (probe("#010203") === "#010203" && probe("#040506") === "#040506") return null;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          return { r, g, b, a: a / 255 };
        };
        const fill = rgba(paint.fill);
        const stroke = paint.strokeWidth > 0 ? rgba(paint.stroke) : null;
        const ink = fill && fill.a > 0 ? fill : stroke && stroke.a > 0 ? stroke : null;
        if (!ink)
          return {
            ok: false as const,
            why: "neither its fill nor its stroke resolves to a visible colour",
          };
        const alpha = ink.a * paint.opacity;
        if (!(alpha > 0)) return { ok: false as const, why: "its opacity is zero" };
        const lum = (r: number, g: number, b: number) => {
          const ch = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
        };
        const ratios: number[] = [];
        for (let i = 0; i < plain.length; i += 4) {
          const [r, g, b] = [plain[i], plain[i + 1], plain[i + 2]];
          const over = (t: number, u: number) => alpha * t + (1 - alpha) * u;
          const fg = lum(over(ink.r, r), over(ink.g, g), over(ink.b, b));
          const bg = lum(r, g, b);
          ratios.push((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05));
        }
        ratios.sort((a, b) => a - b);
        return { ok: true as const, ratio: ratios[Math.floor(ratios.length * 0.1)] };
      },
      {
        shots: [shown, hidden, again].map((b) => b.toString("base64")),
        paint,
      },
    );
  } finally {
    await blank.close();
  }
  if (!measured.ok) throw new Error(`${what}: ${measured.why}`);
  if (!Number.isFinite(measured.ratio)) throw new Error(`${what}: contrast is ${measured.ratio}`);
  return measured.ratio;
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
    expect(await contrastAgainstGround(link, "the footer's privacy link")).toBeGreaterThanOrEqual(
      4.5,
    );
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
      await contrastAgainstGround(
        notice.locator('a[href="/privacy"]'),
        "the dialog's privacy link",
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
