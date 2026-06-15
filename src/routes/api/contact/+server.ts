import { env } from "$env/dynamic/private";
import {
  createIngestEndpoint,
  type SubmissionPayload,
} from "@reddoorla/maintenance/forms";
import type { RequestHandler } from "./$types";

// POST-only ingest endpoint; never prerendered.
export const prerender = false;

const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;

export const POST: RequestHandler = createIngestEndpoint({
  formType: "contact",
  getConfig: () => ({
    url: env.FORMS_INGEST_URL,
    token: env.FORMS_INGEST_TOKEN,
  }),
  unavailableMessage: "The contact form is temporarily unavailable.",
  buildPayload: (body): SubmissionPayload => ({
    name: str(body.name),
    email: str(body.email),
    message: str(body.message),
    sourceUrl: str(body.sourceUrl),
  }),
});
