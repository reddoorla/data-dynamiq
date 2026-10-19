import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { prismicBarrel } from "./scripts/prismic-barrel";
import { privacyServices } from "./scripts/privacy-services";
import kitConfig from "./sveltekit.config.js";

export default defineConfig({
  // SvelteKit 3 takes its configuration here, not from svelte.config.js
  // (which it refuses to start beside).
  plugins: [sveltekit(kitConfig), tailwindcss(), privacyServices(), prismicBarrel()],
  server: {
    fs: {
      // Allow access to files from the project root.
      allow: [".."],
    },
  },
});
