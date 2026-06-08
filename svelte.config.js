import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    warningFilter: (warning) =>
      warning.code !== "element_invalid_self_closing_tag",
  },
  kit: {
    adapter: adapter({ edge: false, split: false }),
    alias: {
      $components: "src/lib/components",
      "$components/*": "src/lib/components/*",
      $utils: "src/lib/utils",
      "$utils/*": "src/lib/utils/*",
      $stores: "src/lib/stores",
      "$stores/*": "src/lib/stores/*",
      $assets: "src/lib/assets",
      "$assets/*": "src/lib/assets/*",
    },
  },
  preprocess: vitePreprocess(),
};

export default config;
