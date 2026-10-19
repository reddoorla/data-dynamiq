import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// VITE_REDDOOR_GATE_FIXTURES=1 builds the /dev fixtures into the bundle, for
// the a11y gate's own build and nothing else (src/routes/dev/+layout.server.ts,
// reddoor-maintenance#948). Set on Netlify it would deploy them, so refuse it
// there, at module load.
if (process.env.VITE_REDDOOR_GATE_FIXTURES && process.env.NETLIFY) {
  throw new Error(
    "VITE_REDDOOR_GATE_FIXTURES is set on Netlify: it builds the /dev fixtures into the " +
      "deployed site. It belongs to the a11y gate's own build (reddoor-maint audit) only. " +
      "Unset it in the Netlify environment.",
  );
}

// SvelteKit 3 refuses `svelte.config.js` (`config_file_unsupported`): its
// configuration is passed to the `sveltekit(...)` plugin in vite.config.ts,
// and kit's options are top-level there, with no `kit` namespace. This object
// is that argument. It lives in its own module, not inline in vite.config.ts,
// because eslint.config.js, the privacy-services plugin and
// tests/kit-config.spec.ts read the same object with a bare `node` (no Vite).
//
// Never set `paths.origin` here: in kit 3 it is also the ONLY origin the CSRF
// check accepts a form POST from, so the contact endpoint would answer 403 on
// the netlify.app host, a deploy preview, and any domain attached after the
// last build (measured on reddoor-starter#187).
/** @type {import('@sveltejs/kit/vite').Config} */
const config = {
  compilerOptions: {
    warningFilter: (warning) => warning.code !== "element_invalid_self_closing_tag",
  },
  adapter: adapter({ edge: false, split: false }),
  // Kit 3 no longer provides `$lib` (`module_removed_lib`). `alias` itself is
  // deprecated (a build warning) in favour of package.json subpath imports;
  // moving to `#lib` is a fleet follow-up (reddoor-maintenance P1-45's plan).
  alias: {
    $lib: "src/lib",
    "$lib/*": "src/lib/*",
    $components: "src/lib/components",
    "$components/*": "src/lib/components/*",
    $utils: "src/lib/utils",
    "$utils/*": "src/lib/utils/*",
    $stores: "src/lib/stores",
    "$stores/*": "src/lib/stores/*",
    $assets: "src/lib/assets",
    "$assets/*": "src/lib/assets/*",
  },
  preprocess: vitePreprocess(),
};

export default config;
