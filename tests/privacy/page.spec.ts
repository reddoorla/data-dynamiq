import { test, expect, type Locator } from "@playwright/test";

/**
 * WCAG contrast of an element's own text against the ground it is painted on.
 *
 * What is measured: the element's computed text colour (`-webkit-text-fill-color`,
 * which is `color` unless set), parsed by a canvas so rgba, oklch and color-mix
 * all work, with its alpha multiplied by the `opacity` of the element and of each
 * ancestor below the ground. Before it reads anything, the helper waits for every
 * running transition and animation on the element, its ancestors and their
 * `::before` and `::after` to finish, so a colour or fade that is still changing
 * is read at rest, not mid-way.
 *
 * The ground is the nearest painted ancestor's computed `background-color`. A
 * candidate is painted only if its `visibility` is `visible`, it is not
 * `display: contents`, and its box has area and overlaps the text; the others are
 * skipped. The text's extent is the element's own text rects (a Range over its
 * contents), not its border box, so padding on a tap target does not count as
 * text. Each translucent background from the element up is composited back to
 * front until one is opaque, and the ground is white if none is. The text is
 * composited over that ground and scored with the WCAG ratio.
 *
 * What is refused, by name, with a throw:
 * - a running infinite transition or animation on the element or an ancestor,
 *   which never settles; a running animation on a scroll or view timeline, which
 *   is not waited on; a running animation with a playback rate of 0, which never
 *   finishes; and a running finite one with more than 3 s of wall-clock time left
 *   to run, its time left divided by its playback rate;
 * - on the element or any ancestor up to `<html>`: `filter`, `backdrop-filter`,
 *   `mix-blend-mode`, `mask-image`, `-webkit-mask-box-image-source` (a mask given
 *   as a border image), `background-clip: text`, `box-shadow`, and a
 *   visible outline (a non-zero width and an outline colour with alpha above 0);
 * - on the element, `text-shadow` and a `-webkit-text-stroke-width` other than 0;
 * - on the element and each ancestor up to the ground, `background-image`;
 * - on the element or an ancestor, a `::first-line` or `::first-letter` whose
 *   colour differs from the element's own, or that paints a background colour
 *   (alpha above 0), a background image, a `text-shadow` that differs from the
 *   element's own, or a `text-decoration-line`
 *   other than `none` that differs from the element's (decorations are not
 *   inherited, so a first line reads `none` under an underlined element, and that
 *   underline is measured as the element's own);
 * - a translucent background under an opacity below 1 (on it, or on any element
 *   between it and the ground): the group's opacity fades that layer too, which
 *   this check does not model;
 * - `opacity` below 1 on the ground or on any ancestor above it: the ground is
 *   composited over white, not over what the faded group sits on;
 * - a candidate ground that covers the text only in part;
 * - on the element or an ancestor, a `::before` or `::after` with generated content
 *   at all, empty or not (`content` other than `none` or `normal`), unless its
 *   computed `display` is `none` and it generates no box: its paint is not
 *   enumerated, so any generated box is refused by name;
 * - a text decoration on the element or an ancestor that is not a plain
 *   `underline`, and an underline with a negative `text-underline-offset`
 *   (overline and line-through are refused).
 *
 * An `underline` on the element or an ancestor is allowed in any colour and any
 * thickness when `text-underline-offset` is `auto` or at least 0: the band then
 * sits below the baseline, and the ink of the text is what is scored. A human's
 * underline in another colour or weight does not turn the gate red.
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
  const measured = await el.evaluate(async (root) => {
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

    // Settle: wait for the running transitions and animations that drive the chain,
    // including those on its pseudo-elements, to end. Element.getAnimations() omits
    // pseudo-element animations, so the document's list is filtered by target. An
    // infinite animation never ends, and a scroll- or view-timeline one ends only
    // when the user scrolls, so both are refused by name rather than waited on. A
    // playback rate of 0 never finishes, so it is refused too. A finite one whose
    // wall-clock time left (its time left in local time, divided by the playback
    // rate) is more than SETTLE_MS is refused as well, so no test hangs.
    const SETTLE_MS = 3000;
    for (;;) {
      const pending: Promise<unknown>[] = [];
      for (const a of document.getAnimations()) {
        const effect = a.effect as KeyframeEffect | null;
        if (!effect || !effect.target || !chain.includes(effect.target)) continue;
        const target = effect.target;
        if (a.playState !== "running") continue;
        const who = `${desc(target)}${effect?.pseudoElement ?? ""}`;
        const endTime = Number(effect.getComputedTiming().endTime);
        if (endTime === Infinity)
          return {
            ok: false as const,
            why: `${who} has a running infinite transition or animation, which never settles`,
          };
        if (a.timeline && a.timeline !== document.timeline)
          return {
            ok: false as const,
            why: `${who} has a running animation on a scroll or view timeline, which is not waited on`,
          };
        const rate = a.playbackRate;
        if (rate === 0)
          return {
            ok: false as const,
            why: `${who} has a running animation with playbackRate 0, which never finishes`,
          };
        const current = Number(a.currentTime ?? 0);
        const left = rate > 0 ? (endTime - current) / rate : current / -rate;
        if (left > SETTLE_MS)
          return {
            ok: false as const,
            why: `${who} has a running animation with ${Math.round(left)} ms left at playbackRate ${rate}, which is too long to wait for`,
          };
        pending.push(a.finished.catch(() => {}));
      }
      if (pending.length === 0) break;
      await Promise.all(pending);
    }

    // Colours are read through a canvas, which parses any CSS colour. An unparseable
    // colour leaves fillStyle at whatever it was, so each parse is tried against two
    // sentinels, and it throws only when both sentinels survive.
    const SENTINELS = ["#010203", "#fefdfc"];
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const rgba = (c: string): [number, number, number, number] => {
      let parsed = false;
      for (const sentinel of SENTINELS) {
        ctx.fillStyle = sentinel;
        ctx.fillStyle = c;
        if (ctx.fillStyle !== sentinel) {
          parsed = true;
          break;
        }
      }
      if (!parsed) throw new Error(`the canvas cannot parse the colour ${JSON.stringify(c)}`);
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255, a / 255];
    };
    const sameColour = (a: number[], b: number[]) => a.every((v, i) => v === b[i]);

    // The text's extent: its own text rects, not the border box, which includes any
    // vertical padding of an inline element and so is not where the glyphs are.
    // Each text rect is clipped to the link's own border boxes, and an empty one is
    // dropped: text clipped out of the link (an sr-only span inside it, say) is not
    // the link's text, and a clipped span would otherwise reach the ground tests.
    const textRange = document.createRange();
    textRange.selectNodeContents(root);
    const borderRects = Array.from(root.getClientRects());
    if (borderRects.length === 0) return refuse(root, "has no box to measure");
    const textRects: { left: number; right: number; top: number; bottom: number }[] = [];
    for (const r of Array.from(textRange.getClientRects())) {
      for (const b of borderRects) {
        const left = Math.max(r.left, b.left);
        const right = Math.min(r.right, b.right);
        const top = Math.max(r.top, b.top);
        const bottom = Math.min(r.bottom, b.bottom);
        if (right > left && bottom > top) textRects.push({ left, right, top, bottom });
      }
    }
    if (textRects.length === 0) return refuse(root, "has no text box to measure");

    // The ground: translucent backgrounds from the element up, composited back to
    // front until one is opaque. `groundIndex` is the element that is opaque.
    const layers: { i: number; bg: [number, number, number, number] }[] = [];
    let groundIndex = chain.length - 1;
    for (let i = 0; i < chain.length; i++) {
      const n = chain[i];
      const cs = getComputedStyle(n);
      const bg = rgba(cs.backgroundColor);
      if (bg[3] === 0) continue;
      const box = n.getBoundingClientRect();
      const painted =
        cs.visibility === "visible" && cs.display !== "contents" && box.width * box.height > 0;
      if (!painted) continue;
      const overlaps = textRects.some(
        (r) => r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top,
      );
      if (!overlaps) continue;
      const inside = textRects.every(
        (r) =>
          r.left >= box.left - 0.5 &&
          r.right <= box.right + 0.5 &&
          r.top >= box.top - 0.5 &&
          r.bottom <= box.bottom + 0.5,
      );
      if (!inside) return refuse(n, "covers the text only in part, which is not measured");
      layers.push({ i, bg });
      if (bg[3] === 1) {
        groundIndex = i;
        break;
      }
    }
    // A translucent layer is faded by the opacity of every element from it up to the
    // ground, not only by the text's opacity, so such a layer is refused.
    for (const { i, bg } of layers) {
      if (bg[3] === 1) continue;
      for (let j = i; j < groundIndex; j++) {
        const o = parseFloat(getComputedStyle(chain[j]).opacity);
        if (o < 1)
          return refuse(
            chain[i],
            `has a translucent background (alpha ${bg[3]}) under opacity ${o} on ${desc(chain[j])}, which is not measured`,
          );
      }
    }
    let ground: [number, number, number] = [1, 1, 1];
    for (let i = layers.length - 1; i >= 0; i--) {
      const [r, g, b, a] = layers[i].bg;
      ground = [
        r * a + ground[0] * (1 - a),
        g * a + ground[1] * (1 - a),
        b * a + ground[2] * (1 - a),
      ];
    }

    // Opacity between the text and the ground is multiplied into the text alpha.
    // Opacity on the ground or above it is not modelled, so it is refused.
    let opacity = 1;
    for (let i = 0; i < chain.length; i++) {
      const o = parseFloat(getComputedStyle(chain[i]).opacity);
      if (i >= groundIndex) {
        if (o < 1)
          return refuse(
            chain[i],
            `has opacity ${o} on the ground or above it, which is not measured`,
          );
      } else {
        opacity *= o;
      }
    }

    const rootStyle = getComputedStyle(root);
    const fill = rgba(rootStyle.getPropertyValue("-webkit-text-fill-color"));

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
      if (v("-webkit-mask-box-image-source") !== "none")
        return refuse(
          n,
          `has -webkit-mask-box-image-source: ${v("-webkit-mask-box-image-source")}, which is not measured`,
        );
      if (v("background-clip") === "text" || v("-webkit-background-clip") === "text")
        return refuse(n, "has background-clip: text, which is not measured");
      if (v("box-shadow") !== "none")
        return refuse(n, `has box-shadow: ${v("box-shadow")}, which is not measured`);
      if (
        v("outline-style") !== "none" &&
        parseFloat(v("outline-width")) > 0 &&
        rgba(v("outline-color"))[3] > 0
      )
        return refuse(
          n,
          `has an outline: ${v("outline-style")} ${v("outline-width")} ${v("outline-color")}, which is not measured`,
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
      // A first line or first letter that paints a colour, background, shadow or
      // decoration of its own is text the element's computed style does not describe.
      for (const pseudo of ["::first-line", "::first-letter"]) {
        const ps = getComputedStyle(n, pseudo);
        const own = [cs.color, cs.getPropertyValue("-webkit-text-fill-color")].map(rgba);
        const psColours = [ps.color, ps.getPropertyValue("-webkit-text-fill-color")].map(rgba);
        if (!sameColour(psColours[0], own[0]) || !sameColour(psColours[1], own[1]))
          return refuse(
            n,
            `has ${pseudo} colour ${ps.color} (fill ${ps.getPropertyValue("-webkit-text-fill-color")}) that differs from its own ${cs.color}, which is not measured`,
          );
        if (rgba(ps.backgroundColor)[3] > 0)
          return refuse(
            n,
            `has ${pseudo} background-color ${ps.backgroundColor}, which is not measured`,
          );
        if (ps.backgroundImage !== "none")
          return refuse(
            n,
            `has ${pseudo} background-image ${ps.backgroundImage}, which is not measured`,
          );
        // text-shadow is inherited, so a first line under an element that sets its own
        // shadow reads that same shadow; only a first line that adds a different one is refused.
        if (ps.textShadow !== "none" && ps.textShadow !== cs.textShadow)
          return refuse(n, `has ${pseudo} text-shadow ${ps.textShadow}, which is not measured`);
        // A decoration is not inherited, so a first line reads `none` under an element
        // that is underlined, and the element's own decoration is measured already. The
        // refusal is for a first line that adds a decoration of a different kind.
        if (ps.textDecorationLine !== "none" && ps.textDecorationLine !== cs.textDecorationLine)
          return refuse(
            n,
            `has ${pseudo} text-decoration-line ${ps.textDecorationLine}, which differs from its own ${cs.textDecorationLine} and is not measured`,
          );
      }
      const decoration = v("text-decoration-line");
      if (decoration !== "none") {
        // An underline is allowed in any colour and thickness with the band below
        // the baseline (offset auto or at least 0). Overline and line-through are not.
        const offset = v("text-underline-offset");
        const allowed =
          decoration === "underline" && (offset === "auto" || parseFloat(offset) >= 0);
        if (!allowed)
          return refuse(
            n,
            `has text-decoration-line: ${decoration} (colour ${v("text-decoration-color")}, thickness ${v("text-decoration-thickness")}, offset ${offset}), which is not measured`,
          );
      }
      if (chain.indexOf(n) <= groundIndex && v("background-image") !== "none")
        return refuse(n, `has background-image: ${v("background-image")}, which is not measured`);
      // Generated content on a pseudo-element is refused by name, empty or not. Its
      // paint (a background, border, outline, shadow, filter or blend) is not listed,
      // because every way it can cover the text would need its own entry.
      for (const pseudo of ["::before", "::after"]) {
        const ps = getComputedStyle(n, pseudo);
        if (ps.display === "none") continue;
        if (ps.content !== "none" && ps.content !== "normal")
          return refuse(n, `has ${pseudo} content ${ps.content}, which is not measured`);
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
