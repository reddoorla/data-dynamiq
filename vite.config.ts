import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { prismicBarrel } from "./scripts/prismic-barrel";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), prismicBarrel()],
  server: {
    fs: {
      // Allow access to files from the project root.
      allow: [".."],
    },
  },
});
