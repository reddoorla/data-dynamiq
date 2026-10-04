import type { Handle } from "@sveltejs/kit";
import { isCmsFramedRoute, widenFrameAncestors } from "$lib/security/cms-framing";

// Only the CMS-framed route is touched. Every other response keeps the headers
// it had before this hook existed: netlify.toml's static [[headers]] block
// (X-Frame-Options SAMEORIGIN and the rest) on prerendered pages, and none of
// those on server-rendered ones. This site does not opt into the central CSP,
// so on /slice-simulator the policy below is the only one sent; it names the
// framers explicitly rather than leaving the route frameable by anyone.
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  if (isCmsFramedRoute(event.route.id)) {
    response.headers.delete("X-Frame-Options");
    const policy = response.headers.get("Content-Security-Policy") ?? "";
    response.headers.set("Content-Security-Policy", widenFrameAncestors(policy));
  }
  return response;
};
