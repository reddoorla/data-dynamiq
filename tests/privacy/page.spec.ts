import { test, expect, type Locator } from "@playwright/test";

/**
 * WCAG contrast of an element's own text against the ground it is painted on.
 *
 * What is measured: the element's computed text colour (`-webkit-text-fill-color`,
 * which is `color` unless set), parsed by a canvas so rgba, oklch and color-mix
 * all work, with its alpha multiplied by the `opacity` of the element and of each
 * ancestor up to `<html>`. The ground is the nearest painted ancestor's computed
 * `background-color`: each translucent background from the element up is
 * composited back to front until one is opaque, and the ground is white if none
 * is. The text is composited over that ground and scored with the WCAG ratio.
 *
 * What is refused, by name, with a throw: on the element or any ancestor up to
 * `<html>`, `filter`, `backdrop-filter`, `mix-blend-mode`, `mask-image`,
 * `background-clip: text`, `box-shadow` and a visible outline; on the element,
 * `text-shadow` and a `-webkit-text-stroke-width` other than 0; on the element
 * and each ancestor up to the ground, `background-image`; on the element or an
 * ancestor, a `::before` or `::after` with content that paints a background, a
 * background image or a box shadow; and a text decoration on the element or an
 * ancestor. The one decoration allowed is the form the page itself uses on the
 * privacy links: an `underline` on the element only, in the text colour, with
 * thickness `auto` or `from-font` and offset `auto` or at least 0. The underline
 * is ink, so it cannot lower the contrast; any other decoration, or the same one
 * on an ancestor, is refused.
 *
 * What is not measured: an `<img>`, video or other element painted behind the
 * text. The footer's link sits on `finalBg.jpg`, so it is scored against the
 * first background colour above the photo (the body's black), not the photo.
 * Anything drawn over the text from another element is not measured either, and
 * neither is a descendant of the element that sets its own colour.
 *
 * This is the narrower check the operator chose (decisions/2026-11-01-2047-p1-84-data-dynamiq-86-round-seven-dirty.md
 * in reddoorla/reddoor-workspace) after seven review rounds of a pixel-based
 * helper, each of rounds 4 to 7 finding new forms it did not model. The old pins,
 * which required a link's colour to equal its parent's, measured none of these
 * either. The helper reads the page and sets no style on it.
 */
async function contrastAgainstGround(el: Locator, name: string): Promise<number> {
  const measured = await el.evaluate((root) => {
    const desc = (n: Element) =>
      n.tagName.toLowerCase() +
      (n.id ? `#${n.id}` : "") +
      [...n.classList]
        .slice(0, 3)
        .map((c) => `.${c}`)
        .join("");
    const refuse = (n: Element, why: string) => ({ ok: false as const, why: `${desc(n)} ${why}` });
    const chain: Element[] = [];
    for (let n: Element | null = root; n; n = n.parentElement) chain.push(n);

    // Colours are read through a canvas, which parses any CSS colour.
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const rgba = (c: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255, a / 255];
    };

    // The ground: translucent backgrounds from the element up, composited back to
    // front until one is opaque. `groundIndex` is the element that is opaque.
    const layers: [number, number, number, number][] = [];
    let groundIndex = chain.length - 1;
    for (let i = 0; i < chain.length; i++) {
      const bg = rgba(getComputedStyle(chain[i]).backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] === 1) {
        groundIndex = i;
        break;
      }
    }
    let ground: [number, number, number] = [1, 1, 1];
    for (let i = layers.length - 1; i >= 0; i--) {
      const [r, g, b, a] = layers[i];
      ground = [
        r * a + ground[0] * (1 - a),
        g * a + ground[1] * (1 - a),
        b * a + ground[2] * (1 - a),
      ];
    }

    let opacity = 1;
    for (const n of chain) opacity *= parseFloat(getComputedStyle(n).opacity);

    const rootStyle = getComputedStyle(root);
    const fill = rgba(rootStyle.getPropertyValue("-webkit-text-fill-color"));
    const sameColour = (a: number[], b: number[]) => a.every((v, i) => v === b[i]);

    for (const n of chain) {
      const cs = getComputedStyle(n);
      const v = (p: string) => cs.getPropertyValue(p).trim();
      if (v("filter") !== "none")
        return refuse(n, `has filter: ${v("filter")}, which is not measured`);
      if (v("backdrop-filter") !== "none")
        return refuse(n, `has backdrop-filter: ${v("backdrop-filter")}, which is not measured`);
      if (v("mix-blend-mode") !== "normal")
        return refuse(n, `has mix-blend-mode: ${v("mix-blend-mode")}, which is not measured`);
      if (v("mask-image") !== "none")
        return refuse(n, `has mask-image: ${v("mask-image")}, which is not measured`);
      if (v("background-clip") === "text" || v("-webkit-background-clip") === "text")
        return refuse(n, "has background-clip: text, which is not measured");
      if (v("box-shadow") !== "none")
        return refuse(n, `has box-shadow: ${v("box-shadow")}, which is not measured`);
      if (v("outline-style") !== "none" && parseFloat(v("outline-width")) > 0)
        return refuse(
          n,
          `has an outline: ${v("outline-style")} ${v("outline-width")}, which is not measured`,
        );
      if (n === root) {
        if (v("text-shadow") !== "none")
          return refuse(n, `has text-shadow: ${v("text-shadow")}, which is not measured`);
        if (parseFloat(v("-webkit-text-stroke-width")) !== 0)
          return refuse(
            n,
            `has -webkit-text-stroke-width: ${v("-webkit-text-stroke-width")}, which is not measured`,
          );
      }
      const decoration = v("text-decoration-line");
      if (decoration !== "none") {
        // The one allowed form: the page's own underline on the element, in the text colour.
        const allowed =
          n === root &&
          decoration === "underline" &&
          sameColour(rgba(v("text-decoration-color")), fill) &&
          ["auto", "from-font"].includes(v("text-decoration-thickness")) &&
          (v("text-underline-offset") === "auto" || parseFloat(v("text-underline-offset")) >= 0);
        if (!allowed)
          return refuse(
            n,
            `has text-decoration-line: ${decoration} (colour ${v("text-decoration-color")}, thickness ${v("text-decoration-thickness")}, offset ${v("text-underline-offset")}), which is not measured`,
          );
      }
      if (chain.indexOf(n) <= groundIndex && v("background-image") !== "none")
        return refuse(n, `has background-image: ${v("background-image")}, which is not measured`);
      for (const pseudo of ["::before", "::after"]) {
        const ps = getComputedStyle(n, pseudo);
        if (ps.content === "none" || ps.content === "normal") continue;
        const paints: string[] = [];
        if (rgba(ps.backgroundColor)[3] > 0) paints.push(`background-color ${ps.backgroundColor}`);
        if (ps.backgroundImage !== "none") paints.push(`background-image ${ps.backgroundImage}`);
        if (ps.boxShadow !== "none") paints.push(`box-shadow ${ps.boxShadow}`);
        if (paints.length > 0)
          return refuse(
            n,
            `has ${pseudo} content ${ps.content} with ${paints.join(" and ")}, which is not measured`,
          );
      }
    }

    // The text: its colour with its alpha times the opacity, composited over the ground.
    const a = fill[3] * opacity;
    const text = [
      fill[0] * a + ground[0] * (1 - a),
      fill[1] * a + ground[1] * (1 - a),
      fill[2] * a + ground[2] * (1 - a),
    ];
    const luminance = (c: number[]) => {
      const [r, g, b] = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const l1 = luminance(text);
    const l2 = luminance(ground);
    return { ok: true as const, ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) };
  });
  if (!measured.ok) throw new Error(`${name}: ${measured.why}`);
  if (!Number.isFinite(measured.ratio)) throw new Error(`${name}: contrast is ${measured.ratio}`);
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
