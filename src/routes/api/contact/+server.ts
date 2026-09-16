import { env } from "$env/dynamic/private";
import { createIngestEndpoint, type SubmissionPayload } from "@reddoorla/maintenance/forms";
import { replyCopyFor } from "$lib/server/reply-copy";
import type { RequestHandler } from "./$types";

// POST-only ingest endpoint; never prerendered.
export const prerender = false;

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

export const POST: RequestHandler = createIngestEndpoint({
  formType: "contact",
  getConfig: () => ({
    url: env.FORMS_INGEST_URL,
    token: env.FORMS_INGEST_TOKEN,
  }),
  unavailableMessage: "The contact form is temporarily unavailable.",
  buildPayload: async (body, event): Promise<SubmissionPayload> => ({
    name: str(body.name),
    email: str(body.email),
    message: str(body.message),
    sourceUrl: str(body.sourceUrl),
    // Confirmation-email copy the client wrote in Prismic, resolved
    // server-side. Undefined until they fill the `form replies` document —
    // the shared package then sends its own per-form-type default, so the
    // site keeps replying exactly as it does today until copy exists.
    _reply: await replyCopyFor(event, "contact"),
  }),
});
