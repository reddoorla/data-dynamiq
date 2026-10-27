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
 * painted; `background-clip: text`, which paints glyphs with a background;
 * `backdrop-filter` under a faded ancestor; and a block's `::first-line` (or
 * the nearest block's `::first-letter`) of another colour, which no computed
 * style of the text shows. On the element itself it refuses `text-shadow` (by
 * WCAG a halo is the text's ground and a drop shadow is not, and the pixels
 * cannot tell them apart) and a stroke of another colour round a visible fill.
 * In `el` it refuses `::before` or `::after` content that is text, `attr()`,
 * `counter()` or alternative text; an empty one (`content: ""`) is a box, and
 * is refused only where hiding it changes a pixel its glyphs paint (a hit test
 * cannot see it, because it answers with the element it belongs to). Anything
 * else drawn over the text is refused too, because it would sit in the ground
 * and never touch the ink: at points inside each text's own boxes, hit-tested
 * with every element made hit-testable, nothing stacked above the element that
 * paints the text may paint anything of its own.
 * Each needs a person, so the test names which rather than pass or fail for a
 * reason that is not the cause.
 *
 * Which ground pixels count: those each element's glyphs change, grown by
 * 2 CSS px, so the counters and the gaps between letters count and padding
 * does not. The verdict for an element is the 1st percentile of the per-pixel
 * ratios over that ring: a lone speck of photo noise does not decide it, while
 * a bad patch as large as one glyph stroke and its ring always does.
 *
 * It also throws when the text paints nothing, when the box resizes, or when
 * the ground moves between the first and last screenshots. One such move is
 * shot again before it is believed, and the retake must repeat what the first
 * attempt saw. The page's own style attributes are saved and set back exactly;
 * it never returns NaN.
 */
async function contrastAgainstGround(el: Locator, name: string): Promise<number> {
  const page = el.page();
  // The ground is only there once its image has loaded.
  await page.waitForLoadState("load");
  await el.scrollIntoViewIfNeeded();
  const shot = () => el.screenshot({ animations: "disabled" });
  let first = await shot();
  type Ground = { nodes: HTMLElement[]; orig: (string | null)[]; boxes?: CSSStyleSheet };
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
    // What a `content` value generates: nothing, a box with no text, or a
    // reason it is refused. Strings are read unquoted, so `""` is empty.
    const generated = (content: string) => {
      if (content === "none" || content === "normal") return null;
      if (/\battr\(/.test(content)) return "attr(), text from an attribute";
      if (/\bcounters?\(/.test(content)) return "counter(), generated numbering";
      const strings: string[] = [];
      const rest = content
        .replace(/url\((?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^)]*)\)/g, " ")
        .replace(/(["'])((?:\\.|(?!\1).)*)\1/g, (_, q, text: string) => {
          strings.push(text);
          return " ";
        });
      if (rest.includes("/")) return "alternative text after a slash";
      if (strings.some((t) => t.trim())) return "text";
      if (rest.trim()) return rest.trim();
      return "box" as const;
    };
    // A selector for one element, so its pseudo-elements can be hidden.
    const path = (n: Element): string =>
      n === document.documentElement
        ? ":root"
        : `${path(n.parentElement!)} > :nth-child(${[...n.parentElement!.children].indexOf(n) + 1})`;
    const boxes: string[] = [];
    const units = [];
    const owned: { n: HTMLElement; rects: DOMRect[] }[] = [];
    for (const n of subtree) {
      for (const pseudo of ["::before", "::after"]) {
        const content = getComputedStyle(n, pseudo).content;
        const made = generated(content);
        if (made === "box") boxes.push(`${path(n)}${pseudo}`);
        else if (made) {
          return refuse(n, `has ${pseudo} content: ${content} (${made}), which is not measured`);
        }
      }
      const rects = [...n.childNodes].flatMap((t) => {
        if (t.nodeType !== Node.TEXT_NODE || !t.textContent?.trim()) return [];
        const range = document.createRange();
        range.selectNodeContents(t);
        return [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      });
      if (rects.length === 0) continue;
      owned.push({ n, rects });
      const style = getComputedStyle(n);
      if (style.textShadow !== "none") {
        return refuse(n, `has text-shadow: ${style.textShadow}; a halo needs judging by hand`);
      }
      const strokeWidth = parseFloat(style.webkitTextStrokeWidth) || 0;
      let opacity = 1;
      const faded: number[] = [];
      let backdrop: Element | null = null;
      let firstLetter = true;
      for (let a: Element | null = n; a; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (s.filter !== "none") return refuse(a, `has filter: ${s.filter}`);
        if (s.mixBlendMode !== "normal") return refuse(a, `has mix-blend-mode: ${s.mixBlendMode}`);
        const mask = s.maskImage || s.webkitMaskImage || "none";
        if (mask !== "none") return refuse(a, `has mask-image: ${mask}`);
        if (/text/.test(`${s.backgroundClip} ${s.webkitBackgroundClip}`)) {
          return refuse(a, "has background-clip: text, so a background paints its glyphs");
        }
        // A block's ::first-line (and ::first-letter on the nearest block)
        // recolours text inside it, and no computed style of the text says so.
        if (s.display !== "inline" && s.display !== "contents") {
          for (const pseudo of firstLetter
            ? ["::first-line", "::first-letter"]
            : ["::first-line"]) {
            const ps = getComputedStyle(a, pseudo);
            for (const prop of ["color", "-webkit-text-fill-color"]) {
              const value = ps.getPropertyValue(prop);
              if (value !== s.getPropertyValue(prop)) {
                return refuse(a, `has ${pseudo} { ${prop}: ${value} }, which is not measured`);
              }
            }
          }
          firstLetter = false;
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
    // Whatever is drawn over the text is in both shots and never applied to
    // the ink, so it is refused: at points inside each text's own boxes, every
    // element stacked above the one that paints that text must paint nothing
    // of its own. Every element is made hit-testable for the moment it takes,
    // so a `pointer-events: none` scrim is found too.
    const clear = (c: string) => c === "transparent" || /(,|\/)\s*0\)$/.test(c);
    const paintsNothing = (h: Element) => {
      if (/^(img|video|canvas|svg|iframe|embed|object|input|textarea|select)$/i.test(h.tagName)) {
        return false;
      }
      const s = getComputedStyle(h);
      const sides = ["top", "right", "bottom", "left"].some(
        (side) =>
          parseFloat(s.getPropertyValue(`border-${side}-width`)) > 0 &&
          !/none|hidden/.test(s.getPropertyValue(`border-${side}-style`)) &&
          !clear(s.getPropertyValue(`border-${side}-color`)),
      );
      return (
        clear(s.backgroundColor) &&
        s.backgroundImage === "none" &&
        !sides &&
        s.boxShadow === "none" &&
        (s.outlineStyle === "none" || !(parseFloat(s.outlineWidth) > 0)) &&
        (!s.backdropFilter || s.backdropFilter === "none") &&
        ![...h.childNodes].some((t) => t.nodeType === Node.TEXT_NODE && t.textContent?.trim()) &&
        ["::before", "::after"].every((p) => generated(getComputedStyle(h, p).content) === null)
      );
    };
    const hitTestable = new CSSStyleSheet();
    hitTestable.replaceSync("*, *::before, *::after { pointer-events: auto !important; }");
    const sheets = document.adoptedStyleSheets;
    document.adoptedStyleSheets = [...sheets, hitTestable];
    try {
      for (const { n, rects } of owned) {
        for (const r of rects) {
          for (const fx of [0.2, 0.5, 0.8]) {
            for (const fy of [0.3, 0.5, 0.7]) {
              const stack = document.elementsFromPoint(
                r.left + fx * r.width,
                r.top + fy * r.height,
              );
              if (!stack.includes(n)) continue;
              const over = stack.slice(0, stack.indexOf(n)).find((h) => !paintsNothing(h));
              if (!over) continue;
              return refuse(
                over,
                root.contains(over)
                  ? `is drawn over ${desc(n)}'s text and paints no text of its own there, which is not measured`
                  : `is drawn over ${desc(n)}'s text from outside it, which is not measured`,
              );
            }
          }
        }
      }
    } finally {
      document.adoptedStyleSheets = sheets;
    }
    if (units.length === 0) return refuse(root, "paints no text");
    (window as unknown as { __ground: Ground }).__ground = {
      nodes,
      orig: nodes.map((n) => n.getAttribute("style")),
    };
    return { ok: true as const, units, inside: subtree.length, boxes };
  });
  if (!plan.ok) throw new Error(`${name}: ${plan.why}`);
  // Put every touched element back to its own style attribute, then hide the
  // text of `hidden` but `show`, which paints as it did, and lift `opaque` to
  // opacity 1 (isolated, so the stacking context that opacity made stays).
  // `boxless` hides the boxes that empty ::before and ::after paint.
  const paintState = (
    hidden: number[],
    opaque: number[],
    show?: Record<number, Record<string, string>>,
    boxless = false,
  ) =>
    el.evaluate(
      (_, { hidden, opaque, show, boxless, boxes }) => {
        const ground = (window as unknown as { __ground: Ground }).__ground;
        const { nodes, orig } = ground;
        nodes.forEach((n, i) => {
          const was = orig[i];
          if (was === null) n.removeAttribute("style");
          else n.setAttribute("style", was);
        });
        if (ground.boxes) {
          const sheet = ground.boxes;
          document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet);
          delete ground.boxes;
        }
        if (boxless) {
          ground.boxes = new CSSStyleSheet();
          ground.boxes.replaceSync(`${boxes.join(", ")} { visibility: hidden !important; }`);
          document.adoptedStyleSheets = [...document.adoptedStyleSheets, ground.boxes];
        }
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
      { hidden, opaque, show: show ?? {}, boxless, boxes: plan.boxes },
    );
  const inside = [...Array(plan.inside).keys()];
  const takeShots = async () => {
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
      if (plan.boxes.length > 0) {
        await paintState([], [], {}, true);
        shots.push(await shot());
      }
      // The ground again, so a ground that moves while it is measured is caught.
      await paintState(inside, []);
      shots.push(await shot());
    } finally {
      await paintState([], []);
    }
    shots.push(await shot());
    return shots;
  };
  const radius = Math.round(2 * (await page.evaluate(() => devicePixelRatio)));
  // Decode on a blank page, out of reach of the site's CSP.
  const blank = await page.context().newPage();
  type Measured = { ok: true; ratio: number } | { ok: false; why: string };
  const measure = (shots: Buffer[]): Promise<Measured> =>
    blank.evaluate(
      async ({ shots, units, radius, boxes }) => {
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
        const measuredUnits = units.map((unit) => {
          const text = px[next++];
          const lifted = unit.opacity < 1 ? px[next++] : ground;
          return { unit, text, lifted };
        });
        // As rendered with the empty pseudo-elements' boxes hidden: a pixel that
        // differs is one such a box paints, over or under the glyphs.
        const boxless = boxes ? px[next++] : px[0];
        let worst = Infinity;
        for (const { unit, text, lifted } of measuredUnits) {
          const what = unit.what;
          const mask = new Uint8Array(w * h);
          let changed = 0;
          let underBox = false;
          for (let i = 0; i < text.length; i += 4) {
            if (differs(text, ground, i)) {
              mask[i / 4] = 1;
              changed++;
              if (differs(px[0], boxless, i)) underBox = true;
            }
          }
          if (changed === 0)
            return {
              ok: false as const,
              why: `${what}: its text changes no pixel, so it is unpainted or the colour of its ground`,
            };
          if (underBox)
            return {
              ok: false as const,
              why: `${what}: an empty ::before or ::after box paints where its glyphs are, which is not measured`,
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
      {
        shots: shots.map((b) => b.toString("base64")),
        units: plan.units,
        radius,
        boxes: plan.boxes.length > 0,
      },
    );
  let measured: Measured;
  try {
    const shots = await takeShots();
    measured = await measure(shots);
    // A ground that moved once is shot again, once, before it is believed. The
    // retake counts only if its first shot as rendered and its first ground
    // each repeat one the first attempt took, so a ground that keeps moving
    // gets no better odds of matching itself by chance than it had.
    if (!measured.ok && /ground moved/.test(measured.why)) {
      first = await shot();
      const again = await takeShots();
      const repeats = (b: Buffer, ...was: Buffer[]) => was.some((w) => w.equals(b));
      if (
        repeats(again[0], shots[0], shots[shots.length - 1]) &&
        repeats(again[1], shots[1], shots[shots.length - 2])
      ) {
        measured = await measure(again);
      }
    }
  } finally {
    await blank.close();
    await el.evaluate(() => {
      delete (window as unknown as { __ground?: Ground }).__ground;
    });
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
