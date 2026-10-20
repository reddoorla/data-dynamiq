import { execFileSync } from "node:child_process";
import { createServer } from "node:http";

// The smoke suite submits the real contact form to the dev server, and the
// server's ingest call lands here instead of on the central endpoint:
// playwright.config.ts calls `useIngestCapture()`, which points FORMS_INGEST_URL
// at this capture server, and Playwright starts the server as its globalSetup.
// Tests read what arrived through `capturedWith`, so they check the body central
// ingest would have received.
//
// The port is allocated once, in the main process, and handed to the workers
// and the dev server through the environment, so two suites side by side do not
// collide (the shared base config allocates the dev server's port the same way).
const PORT_VAR = "INGEST_CAPTURE_PORT";

function allocateFreePortSync(): string {
  const out = execFileSync(
    process.execPath,
    [
      "-e",
      'const s=require("node:net").createServer();s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>process.stdout.write(String(p)))});',
    ],
    { encoding: "utf8", timeout: 5000 },
  ).trim();
  if (!/^\d+$/.test(out))
    throw new Error(`could not allocate a port for the ingest capture: ${out}`);
  return out;
}

const origin = () => `http://127.0.0.1:${process.env[PORT_VAR]}`;

/** Called from playwright.config.ts. Forced, not defaulted: a FORMS_INGEST_URL in
 *  the shell must not turn a test run into a real lead. The dev server inherits it. */
export function useIngestCapture() {
  process.env[PORT_VAR] ??= allocateFreePortSync();
  process.env.FORMS_INGEST_URL = `${origin()}/api/forms/smoke`;
  process.env.FORMS_INGEST_TOKEN = "smoke";
}

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
    server.listen(Number(process.env[PORT_VAR]), "127.0.0.1", () => resolve());
  });
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
}

/** Every ingest body received so far whose JSON contains `marker`. The capture
 *  outlives a retry, so a marker must be unique per attempt (see `attemptMarker`). */
export async function capturedWith(marker: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${origin()}/captured`);
  const all = (await res.json()) as unknown[];
  return all.filter(
    (b): b is Record<string, unknown> =>
      typeof b === "object" && b !== null && JSON.stringify(b).includes(marker),
  );
}

/** A marker unique to this test AND this retry attempt. */
export function attemptMarker(kind: string, info: { testId: string; retry: number }): string {
  return `smoke ${kind} ${info.testId} attempt ${info.retry}`;
}
