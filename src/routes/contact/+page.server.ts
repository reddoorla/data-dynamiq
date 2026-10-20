import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// The contact form is a modal on the homepage; `#contact` opens it on load. The
// fleet's form-e2e probe enters at /contact, so send it, and anyone else, there.
export const prerender = false;

export const load: PageServerLoad = () => {
  redirect(301, "/#contact");
};
