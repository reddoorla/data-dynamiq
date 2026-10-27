import { test, expect, type Locator } from "@playwright/test";

/**
 * WCAG contrast of an element's text against the ground it is actually drawn on.
 *
 * It is an allowlist: it scores only paint it can model exactly, and throws,
 * naming the element and the property, on anything else. Each element that
 * paints a text node of its own inside `el` (a child span with its own colour,
 * as well as the link) is scored separately, and the verdict is the worst.
 *
 * What it models, for each such element:
 * - The text colour, resolved rather than read from glyphs: the computed
 *   `-webkit-text-fill-color` (which is `color` unless set), or the
 *   `-webkit-text-stroke` colour when the fill is transparent, parsed by a
 *   canvas, so rgba, oklch and color-mix all work. A stroke the same colour
 *   as the fill is heavier text.
 * - Opacity, once: O is the product of `opacity` from the element itself up to
 *   the root. With H the ground as rendered and U the same ground with each of
 *   those opacities lifted to 1, the rendered text is H + O·alpha·(text − U).
 *   That is exact whether or not a faded ancestor paints a background of its
 *   own under the text, which is where multiplying O over H counted it twice.
 * - The ground, measured, because the footer sits on a photo no computed
 *   background-color can see: the box is screenshotted with every text fill,
 *   stroke and decoration in `el` transparent. `color` itself is left alone,
 *   so a currentColor border or icon stays in the ground. `backdrop-filter`
 *   acts on the ground, so that screenshot already carries it.
 *
 * What it refuses, on the element or any ancestor up to the root: `filter`,
 * `mix-blend-mode` and `mask-image`, which change the colour after it is
 * painted; `background-clip: text`, which paints glyphs with a background; and
 * `backdrop-filter` under a faded ancestor. On the element itself it refuses
 * `text-shadow` (by WCAG a halo is the text's ground and a drop shadow is not,
 * and the pixels cannot tell them apart), a stroke of another colour round a
 * visible fill, and `::before` or `::after` text. Each needs a person, so the
 * test names which rather than pass or fail for a reason that is not the cause.
 *
 * Which ground pixels count: those each element's glyphs change, grown by
 * 2 CSS px, so the counters and the gaps between letters count and padding
 * does not. The verdict for an element is the 1st percentile of the per-pixel
 * ratios over that ring: a lone speck of photo noise does not decide it, while
 * a bad patch as large as one glyph stroke and its ring always does.
 *
 * It also throws when the text paints nothing, when the box resizes, or when
 * the ground moves between the first and last screenshots. The page's own
 * style attributes are saved and set back exactly; it never returns NaN.
 */
async function contrastAgainstGround(el: Locator, name: string): Promise<number> {
  const page = el.page();
  // The ground is only there once its image has loaded.
  await page.waitForLoadState("load");
  await el.scrollIntoViewIfNeeded();
  const shot = () => el.screenshot({ animations: "disabled" });
  const first = await shot();
  type Ground = { nodes: HTMLElement[]; orig: (string | null)[] };
  const plan = await el.evaluate((root) => {
    const desc = (n: Element) =>
      n.tagName.toLowerCase() +
      (n.id ? `#${n.id}` : "") +
      [...n.classList]
        .slice(0, 3)
        .map((c) => `.${c}`)
        .join("");
    const refuse = (n: Element, why: string) => ({ ok: false as const, why: `${desc(n)} ${why}` });
    const subtree = [root, ...root.querySelectorAll("*")] as HTMLElement[];
    const nodes = [...subtree];
    const indexOf = (n: Element) => {
      const i = nodes.indexOf(n as HTMLElement);
      return i >= 0 ? i : nodes.push(n as HTMLElement) - 1;
    };
    const units = [];
    for (const n of subtree) {
      for (const pseudo of ["::before", "::after"]) {
        const content = getComputedStyle(n, pseudo).content;
        if (/^["'].*\S/.test(content)) {
          return refuse(n, `has ${pseudo} text (${content}), which is not measured`);
        }
      }
      const painted = [...n.childNodes].some((t) => {
        if (t.nodeType !== Node.TEXT_NODE || !t.textContent?.trim()) return false;
        const range = document.createRange();
        range.selectNodeContents(t);
        return [...range.getClientRects()].some((r) => r.width > 0 && r.height > 0);
      });
      if (!painted) continue;
      const style = getComputedStyle(n);
      if (style.textShadow !== "none") {
        return refuse(n, `has text-shadow: ${style.textShadow}; a halo needs judging by hand`);
      }
      const strokeWidth = parseFloat(style.webkitTextStrokeWidth) || 0;
      let opacity = 1;
      const faded: number[] = [];
      let backdrop: Element | null = null;
      for (let a: Element | null = n; a; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (s.filter !== "none") return refuse(a, `has filter: ${s.filter}`);
        if (s.mixBlendMode !== "normal") return refuse(a, `has mix-blend-mode: ${s.mixBlendMode}`);
        const mask = s.maskImage || s.webkitMaskImage || "none";
        if (mask !== "none") return refuse(a, `has mask-image: ${mask}`);
        if (/text/.test(`${s.backgroundClip} ${s.webkitBackgroundClip}`)) {
          return refuse(a, "has background-clip: text, so a background paints its glyphs");
        }
        if (s.backdropFilter && s.backdropFilter !== "none") backdrop = a;
        const o = Number(s.opacity);
        if (o < 1) {
          opacity *= o;
          faded.push(indexOf(a));
        }
      }
      if (backdrop && opacity < 1) {
        return refuse(backdrop, "has backdrop-filter under an opacity below 1");
      }
      units.push({
        what: `${desc(n)} (fill ${style.webkitTextFillColor}, stroke ${strokeWidth}px ${style.webkitTextStrokeColor}, opacity ${opacity})`,
        index: subtree.indexOf(n),
        // What this element paints with, set back explicitly when it is shown:
        // an ancestor's hidden fill would otherwise be inherited.
        paint: {
          "-webkit-text-fill-color": style.webkitTextFillColor,
          "-webkit-text-stroke-color": style.webkitTextStrokeColor,
          "text-decoration-color": style.textDecorationColor,
          "text-emphasis-color": style.getPropertyValue("text-emphasis-color"),
        } as Record<string, string>,
        fill: style.webkitTextFillColor,
        stroke: strokeWidth > 0 ? style.webkitTextStrokeColor : "",
        opacity,
        faded,
      });
    }
    if (units.length === 0) return refuse(root, "paints no text");
    (window as unknown as { __ground: Ground }).__ground = {
      nodes,
      orig: nodes.map((n) => n.getAttribute("style")),
    };
    return { ok: true as const, units, inside: subtree.length };
  });
  if (!plan.ok) throw new Error(`${name}: ${plan.why}`);
  // Put every touched element back to its own style attribute, then hide the
  // text of `hidden` but `show`, which paints as it did, and lift `opaque` to
  // opacity 1 (isolated, so the stacking context that opacity made stays).
  const paintState = (
    hidden: number[],
    opaque: number[],
    show?: Record<number, Record<string, string>>,
  ) =>
    el.evaluate(
      (_, { hidden, opaque, show }) => {
        const { nodes, orig } = (window as unknown as { __ground: Ground }).__ground;
        nodes.forEach((n, i) => {
          const was = orig[i];
          if (was === null) n.removeAttribute("style");
          else n.setAttribute("style", was);
        });
        const hide = [
          "-webkit-text-fill-color",
          "-webkit-text-stroke-color",
          "text-decoration-color",
          "text-emphasis-color",
        ];
        for (const i of hidden) {
          for (const p of hide) {
            nodes[i].style.setProperty(p, show[i]?.[p] ?? "transparent", "important");
          }
        }
        for (const i of opaque) {
          nodes[i].style.setProperty("opacity", "1", "important");
          nodes[i].style.setProperty("isolation", "isolate", "important");
        }
      },
      { hidden, opaque, show: show ?? {} },
    );
  const inside = [...Array(plan.inside).keys()];
  const shots = [first];
  try {
    await paintState(inside, []);
    shots.push(await shot());
    for (const unit of plan.units) {
      await paintState(inside, [], { [unit.index]: unit.paint });
      shots.push(await shot());
      if (unit.opacity < 1) {
        await paintState(inside, unit.faded);
        shots.push(await shot());
      }
    }
    // The ground again, so a ground that moves while it is measured is caught.
    await paintState(inside, []);
    shots.push(await shot());
  } finally {
    await paintState([], []);
    await el.evaluate(() => {
      delete (window as unknown as { __ground?: Ground }).__ground;
    });
  }
  shots.push(await shot());
  const radius = Math.round(2 * (await page.evaluate(() => devicePixelRatio)));
  // Decode on a blank page, out of reach of the site's CSP.
  const blank = await page.context().newPage();
  let measured: { ok: true; ratio: number } | { ok: false; why: string };
  try {
    measured = await blank.evaluate(
      async ({ shots, units, radius }) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        const decoded: { data: Uint8ClampedArray; w: number; h: number }[] = [];
        for (const b64 of shots) {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          decoded.push({
            data: ctx.getImageData(0, 0, img.width, img.height).data,
            w: img.width,
            h: img.height,
          });
        }
        const { w, h } = decoded[0];
        if (decoded.some((d) => d.w !== w || d.h !== h)) {
          return { ok: false as const, why: "its box changed size between the screenshots" };
        }
        const px = decoded.map((d) => d.data);
        const differs = (a: Uint8ClampedArray, b: Uint8ClampedArray, i: number) =>
          a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2];
        // As rendered, first and last; and the ground, first and last.
        for (const [a, b] of [
          [px[0], px[px.length - 1]],
          [px[1], px[px.length - 2]],
        ]) {
          for (let i = 0; i < a.length; i += 4) {
            if (differs(a, b, i)) {
              return { ok: false as const, why: "its ground moved between the screenshots" };
            }
          }
        }
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
        const lum = (r: number, g: number, b: number) => {
          const ch = (v: number) => {
            const s = Math.min(255, Math.max(0, v)) / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
        };
        // Grow a mask by `radius` pixels in each direction (a square).
        const grow = (mask: Uint8Array) => {
          const pass = (src: Uint8Array, along: boolean) => {
            const out = new Uint8Array(w * h);
            const [outer, inner] = along ? [h, w] : [w, h];
            for (let o = 0; o < outer; o++) {
              const at = (k: number) => (along ? o * w + k : k * w + o);
              let next = Infinity;
              const nearest = new Float64Array(inner);
              for (let k = inner - 1; k >= 0; k--) {
                if (src[at(k)]) next = k;
                nearest[k] = next - k;
              }
              let last = -Infinity;
              for (let k = 0; k < inner; k++) {
                if (src[at(k)]) last = k;
                if (k - last <= radius || nearest[k] <= radius) out[at(k)] = 1;
              }
            }
            return out;
          };
          return pass(pass(mask, true), false);
        };
        const ground = px[1];
        let next = 2;
        let worst = Infinity;
        for (const unit of units) {
          const text = px[next++];
          const lifted = unit.opacity < 1 ? px[next++] : ground;
          const what = unit.what;
          const mask = new Uint8Array(w * h);
          let changed = 0;
          for (let i = 0; i < text.length; i += 4) {
            if (differs(text, ground, i)) {
              mask[i / 4] = 1;
              changed++;
            }
          }
          if (changed === 0)
            return {
              ok: false as const,
              why: `${what}: its text changes no pixel, so it is unpainted or the colour of its ground`,
            };
          const fill = rgba(unit.fill);
          const stroke = unit.stroke ? rgba(unit.stroke) : null;
          const same = (p: typeof fill, q: typeof fill) =>
            !!p && !!q && p.r === q.r && p.g === q.g && p.b === q.b && p.a === q.a;
          if (fill && fill.a > 0 && stroke && stroke.a > 0 && !same(fill, stroke)) {
            return {
              ok: false as const,
              why: `${what}: a -webkit-text-stroke of another colour outlines its fill; judge it by hand`,
            };
          }
          const ink = fill && fill.a > 0 ? fill : stroke && stroke.a > 0 ? stroke : null;
          if (!ink) {
            return {
              ok: false as const,
              why: `${what}: neither its fill nor its stroke resolves to a visible colour`,
            };
          }
          const alpha = ink.a * unit.opacity;
          if (!(alpha > 0)) return { ok: false as const, why: `${what}: its opacity is zero` };
          const ring = grow(mask);
          const ratios: number[] = [];
          for (let p = 0; p < ring.length; p++) {
            if (!ring[p]) continue;
            const i = p * 4;
            const [r, g, b] = [ground[i], ground[i + 1], ground[i + 2]];
            const fg = lum(
              r + alpha * (ink.r - lifted[i]),
              g + alpha * (ink.g - lifted[i + 1]),
              b + alpha * (ink.b - lifted[i + 2]),
            );
            const bg = lum(r, g, b);
            ratios.push((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05));
          }
          ratios.sort((a, b) => a - b);
          worst = Math.min(worst, ratios[Math.floor(ratios.length * 0.01)]);
        }
        return { ok: true as const, ratio: worst };
      },
      { shots: shots.map((b) => b.toString("base64")), units: plan.units, radius },
    );
  } finally {
    await blank.close();
  }
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
