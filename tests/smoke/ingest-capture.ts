import { createServer } from "node:http";

// The smoke suite submits the real contact form to the dev server, and the
// server's ingest call lands here instead of on the central endpoint:
// playwright.config.ts points FORMS_INGEST_URL at this capture server, which
// Playwright starts as its globalSetup. Tests read what arrived through
// `capturedWith`, so they check the body central ingest would have received.
export const INGEST_CAPTURE_PORT = 4319;
const origin = `http://127.0.0.1:${INGEST_CAPTURE_PORT}`;
export const INGEST_CAPTURE_URL = `${origin}/api/forms/smoke`;

export default async function globalSetup() {
  const bodies: unknown[] = [];
  const server = createServer((req, res) => {
    if (req.method === "GET" && req.url === "/captured") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(bodies));
      return;
    }
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        bodies.push(JSON.parse(raw));
      } catch {
        bodies.push(raw);
      }
      res.writeHead(200, { "content-type": "application/json" });
      // What central ingest answers for an accepted submission.
      res.end(JSON.stringify({ ok: true, id: "smoke" }));
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(INGEST_CAPTURE_PORT, "127.0.0.1", () => resolve());
  });
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
}

/** Every ingest body received so far whose JSON contains `marker`. */
export async function capturedWith(marker: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${origin}/captured`);
  const all = (await res.json()) as unknown[];
  return all.filter(
    (b): b is Record<string, unknown> =>
      typeof b === "object" && b !== null && JSON.stringify(b).includes(marker),
  );
}
