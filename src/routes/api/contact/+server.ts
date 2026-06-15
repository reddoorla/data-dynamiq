import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { submitToIngest, screenSubmission } from "@reddoorla/maintenance/forms";
import type { RequestHandler } from "./$types";

// POST-only ingest endpoint; never prerendered.
export const prerender = false;

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

export const POST: RequestHandler = async ({ request, fetch }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Bot screen: honeypot only (a prerendered page has no fresh server timestamp
  // for the timing check; screenSubmission treats a missing elapsedMs as OK).
  const screen = screenSubmission({ botField: str(body["bot-field"]) ?? null });
  if (!screen.ok) return json({ ok: true }); // silently accept, do not forward

  if (!env.FORMS_INGEST_URL || !env.FORMS_INGEST_TOKEN) {
    console.error("[contact] FORMS_INGEST_URL / FORMS_INGEST_TOKEN not set");
    return json(
      { ok: false, error: "The contact form is temporarily unavailable." },
      { status: 500 },
    );
  }

  const result = await submitToIngest({
    url: env.FORMS_INGEST_URL,
    token: env.FORMS_INGEST_TOKEN,
    fetch,
    payload: {
      formType: "contact",
      name: str(body.name),
      email: str(body.email),
      message: str(body.message),
      sourceUrl: str(body.sourceUrl),
    },
  });
  if (!result.ok) {
    console.error(`[contact] ingest failed (${result.status}): ${result.error}`);
    return json(
      { ok: false, error: "Something went wrong sending your message. Please try again." },
      { status: 502 },
    );
  }
  return json({ ok: true });
};
