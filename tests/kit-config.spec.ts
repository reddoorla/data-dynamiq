// SvelteKit 3 moved its configuration out of svelte.config.js and into the
// `sveltekit(...)` Vite plugin (reddoor-maintenance P1-53, ported from
// reddoor-starter#187 and 1836dig#30). These tests hold the
// places that move can go wrong without a build failing:
//   - the config object never reaching the plugin (the adapter and aliases
//     would just vanish);
//   - a svelte.config.js coming back beside it (kit 3 refuses to start);
//   - `paths.origin` being set, which in kit 3 is also the only origin the
//     CSRF check accepts, so the contact endpoint answers 403 on every other host;
//   - an environment variable read in src/ but not declared in src/env.ts,
//     which kit 3 turns into `undefined` with only a build warning;
//   - a `$app/stores` import, whose stores throw `app_stores_removed`.
// This repo's only test runner is Playwright, so the gate is a spec here
// rather than reddoor-starter's vitest file. It needs no browser.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfigFromFile, type Plugin, type PluginOption } from "vite";
import { variables } from "../src/env";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function flatten(option: PluginOption): Promise<Plugin[]> {
  const value = await option;
  if (!value) return [];
  if (Array.isArray(value)) return (await Promise.all(value.map(flatten))).flat();
  return [value as Plugin];
}

/** The options SvelteKit itself validated, read off its own plugin: what kit
 *  will actually use, not what a config file says. */
async function kitOptions(): Promise<Record<string, unknown>> {
  const loaded = await loadConfigFromFile(
    { command: "build", mode: "production" },
    join(repoRoot, "vite.config.ts"),
    repoRoot,
    "silent",
  );
  if (!loaded) throw new Error("vite.config.ts did not load");
  const plugins = await flatten(loaded.config.plugins ?? []);
  const setup = plugins.find((p) => p.name === "vite-plugin-sveltekit-setup");
  if (!setup) throw new Error("vite.config.ts does not register the sveltekit() plugin");
  return (setup.api as { options: Record<string, unknown> }).options;
}

async function withNetlifyEnv<T>(run: () => Promise<T>): Promise<T> {
  const names = ["URL", "DEPLOY_URL", "DEPLOY_PRIME_URL", "SITE_NAME"] as const;
  const saved = Object.fromEntries(names.map((n) => [n, process.env[n]]));
  Object.assign(process.env, {
    URL: "https://www.example.com",
    DEPLOY_URL: "https://6123abc--example-site.netlify.app",
    DEPLOY_PRIME_URL: "https://deploy-preview-4--example-site.netlify.app",
    SITE_NAME: "example-site",
  });
  try {
    return await run();
  } finally {
    for (const n of names) {
      if (saved[n] === undefined) delete process.env[n];
      else process.env[n] = saved[n];
    }
  }
}

test.describe("the SvelteKit config reaches the sveltekit() plugin", () => {
  test("has no svelte.config.js or svelte.config.ts, which kit 3 refuses to start beside", () => {
    expect(existsSync(join(repoRoot, "svelte.config.js"))).toBe(false);
    expect(existsSync(join(repoRoot, "svelte.config.ts"))).toBe(false);
  });

  test("hands kit the Netlify adapter and no CSP, as kit 2 had", async () => {
    const options = await kitOptions();
    expect((options.adapter as { name?: string }).name).toBe("@sveltejs/adapter-netlify");
    // This site never opted into a kit CSP (src/hooks.server.ts writes the
    // only policy, on /slice-simulator). Kit's defaults set no source list;
    // its two boolean directives default to false.
    const csp = options.csp as { directives: Record<string, unknown> };
    expect(
      Object.entries(csp.directives)
        .filter(([, v]) => v !== undefined && v !== false)
        .map(([k]) => k),
    ).toEqual([]);
  });

  test("keeps `$lib` resolving: kit 3 no longer provides it", async () => {
    const options = await kitOptions();
    expect(options.alias).toMatchObject({
      $lib: "src/lib",
      "$lib/*": "src/lib/*",
      $components: "src/lib/components",
      $utils: "src/lib/utils",
      $stores: "src/lib/stores",
      $assets: "src/lib/assets",
    });
  });
});

// Kit 3's `paths.origin` is both the prerender origin and the only origin its
// CSRF check accepts a form POST from. Set on Netlify, a contact form
// answered 403 on a domain alias and on a custom domain attached after the
// last build (measured on reddoor-starter#187's built server).
test.describe("the origin", () => {
  test("is never kit's paths.origin or a CSRF list, so the form posts from any host it is served on", async () => {
    const r = spawnSync(
      process.execPath,
      [
        "-e",
        `import("./sveltekit.config.js").then((m) => console.log(JSON.stringify({ paths: m.default.paths ?? null, csrf: m.default.csrf ?? null })))`,
      ],
      {
        cwd: repoRoot,
        env: { ...process.env, URL: "https://www.example.com" },
        encoding: "utf-8",
      },
    );
    expect(r.status, r.stderr).toBe(0);
    expect(JSON.parse(r.stdout)).toEqual({ paths: null, csrf: null });
    const options = await withNetlifyEnv(kitOptions);
    expect((options.paths as { origin?: string }).origin).toBeUndefined();
    expect((options.csrf as { trustedOrigins: string[] }).trustedOrigins).toEqual([]);
  });
});

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(svelte|ts|js)$/.test(entry) && !/\.(test|spec)\.ts$/.test(entry)) out.push(full);
  }
  return out;
}

// What a source file reads from "$app/env/<type>": through a namespace import
// (`env.NAME`, `env["NAME"]`, `const { NAME } = env`) or a named import. Kit 3
// exports only the declared names, so any of these on an undeclared name is
// `undefined` at runtime with at most a build warning.
function envReads(source: string): { type: "public" | "private"; name: string }[] {
  const reads: { type: "public" | "private"; name: string }[] = [];
  const add = (type: string, name: string) =>
    reads.push({ type: type as "public" | "private", name });
  const namespaces = source.matchAll(
    /import\s+\*\s+as\s+(\w+)\s+from\s+["']\$app\/env\/(public|private)["']/g,
  );
  for (const [, binding, type] of namespaces) {
    for (const [, name] of source.matchAll(new RegExp(`\\b${binding}\\.([A-Z][A-Z0-9_]*)`, "g"))) {
      add(type, name);
    }
    for (const [, name] of source.matchAll(
      new RegExp(`\\b${binding}\\[\\s*["'\`]([A-Z][A-Z0-9_]*)["'\`]\\s*\\]`, "g"),
    )) {
      add(type, name);
    }
    for (const [, body] of source.matchAll(
      new RegExp(`\\{([^}]*)\\}\\s*=\\s*${binding}\\b`, "g"),
    )) {
      for (const [, name] of body.matchAll(/(?:^|,)\s*([A-Z][A-Z0-9_]*)\b/g)) add(type, name);
    }
  }
  const named = source.matchAll(
    /import\s*\{([^}]*)\}\s*from\s+["']\$app\/env\/(public|private)["']/g,
  );
  for (const [, body, type] of named) {
    for (const [, name] of body.matchAll(/(?:^|,)\s*([A-Z][A-Z0-9_]*)\b/g)) add(type, name);
  }
  return reads;
}

test.describe("environment variables (kit 3 exposes only what src/env.ts declares)", () => {
  const files = walk(join(repoRoot, "src"));

  test("finds the reads it is meant to check (the instrument's control)", () => {
    const names = files.flatMap((f) => envReads(readFileSync(f, "utf8")).map((r) => r.name));
    expect(names).toContain("FORMS_INGEST_URL");
    expect(names).toContain("FORMS_INGEST_TOKEN");
    expect(names).toContain("PUBLIC_TURNSTILE_SITE_KEY");
  });

  test("sees every way a file can read one (the instrument's own control)", () => {
    const source = [
      'import * as env from "$app/env/private";',
      'import { NAMED_A, NAMED_B as b } from "$app/env/public";',
      "env.DOTTED;",
      'env["BRACKETED"];',
      "const { DESTRUCTURED, RENAMED: r } = env;",
    ].join("\n");
    expect(
      envReads(source)
        .map((read) => `${read.type}:${read.name}`)
        .sort(),
    ).toEqual(
      [
        "private:BRACKETED",
        "private:DESTRUCTURED",
        "private:DOTTED",
        "private:RENAMED",
        "public:NAMED_A",
        "public:NAMED_B",
      ].sort(),
    );
  });

  test("declares every variable src/ reads, as public exactly when it is read from $app/env/public", () => {
    const declared = variables as Record<string, { public?: boolean }>;
    const missing = files.flatMap((file) =>
      envReads(readFileSync(file, "utf8"))
        .filter(
          ({ type, name }) =>
            !(name in declared) || !!declared[name].public !== (type === "public"),
        )
        .map(({ type, name }) => `${relative(repoRoot, file)}: ${name} from $app/env/${type}`),
    );
    expect(missing).toEqual([]);
  });

  test("imports nothing from $app/stores, whose stores throw app_stores_removed in kit 3", () => {
    const stores = files.filter((file) =>
      /(?:from|import\s*\()\s*["']\$app\/stores["']/.test(readFileSync(file, "utf8")),
    );
    expect(stores.map((f) => relative(repoRoot, f))).toEqual([]);
  });

  test("reads none through $env/*, whose `env` object is now only a view of the declared list", () => {
    const legacy = files.filter((file) =>
      /(?:from|import\s*\()\s*["']\$env\//.test(readFileSync(file, "utf8")),
    );
    expect(legacy.map((f) => relative(repoRoot, f))).toEqual([]);
  });
});
