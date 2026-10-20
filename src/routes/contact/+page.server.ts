import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// The contact form is a modal on the homepage; `#contact` opens it on load. The
// fleet's form-e2e probe enters at /contact, so send it, and anyone else, there.
export const prerender = false;

// The query string rides along, so a campaign link keeps its UTM parameters.
export const load: PageServerLoad = ({ url }) => {
  redirect(301, `/${url.search}#contact`);
};
