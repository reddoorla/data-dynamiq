// The Prismic CLI writes prismicio-types.d.ts at the project root, outside the
// src/** glob SvelteKit includes; importing it brings its @prismicio/client
// augmentation (Content.*, the typed client) into the program.
import type {} from "../prismicio-types";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
