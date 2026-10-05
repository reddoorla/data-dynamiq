import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { prismicBarrel } from "./scripts/prismic-barrel";
import { privacyServices } from "./scripts/privacy-services";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), privacyServices(), prismicBarrel()],
  server: {
    fs: {
      // Allow access to files from the project root.
      allow: [".."],
    },
  },
});
