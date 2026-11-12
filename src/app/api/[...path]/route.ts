// Same-origin proxy: the browser calls /api/* on this app, and this handler
// forwards the request to the backend named by API_INTERNAL_URL at runtime.
//
// It is reachable by anyone who can reach the app, so it forwards only the
// read endpoints the UI uses, plus POST /api/search. Everything else is a
// 404 here and never reaches the backend. When the backend gains write
// endpoints, they need authentication in front before being added below.

export const dynamic = "force-dynamic";

const BASE = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const ID = "[A-Za-z0-9._:~-]{1,200}";   // event ids look like "congress:119:hr:10006"
const ALLOWED_GET = [
  /^\/api\/health$/,
  /^\/api\/today$/,
  /^\/api\/companies$/,
  new RegExp(`^/api/companies/${ID}$`),
  /^\/api\/themes$/,
  new RegExp(`^/api/themes/${ID}$`),
  /^\/api\/government$/,
  new RegExp(`^/api/events/${ID}$`),
  /^\/api\/graph$/,
  /^\/api\/alerts$/,
];
const ALLOWED_POST = [/^\/api\/search$/];

const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
  "cache-control": "no-store",
};

function reply(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), { status, headers: JSON_HEADERS });
}

/** Reads the request body, giving up as soon as it passes the limit. */
async function readLimited(req: Request): Promise<string | null> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function forward(req: Request): Promise<Response> {
  if (!BASE) {
    // No backend configured: tell the client so it can use bundled sample data.
    return reply(501, "API not configured");
  }

  const { pathname, search } = new URL(req.url);
  const isPost = req.method === "POST";
  const allowed = isPost ? ALLOWED_POST : ALLOWED_GET;
  if (!allowed.some((re) => re.test(pathname))) return reply(404, "Not found");

  const init: RequestInit = {
    method: isPost ? "POST" : "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    redirect: "manual",                                   // never follow the backend somewhere else
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  };

  if (isPost) {
    const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (type !== "application/json") return reply(415, "Expected application/json");
    const body = await readLimited(req);
    if (body === null) return reply(413, "Request body too large");
    init.body = body;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}${pathname}${isPost ? "" : search}`, init);
  } catch {
    return reply(502, "API unreachable");
  }

  if (upstream.status >= 300 && upstream.status < 400) return reply(502, "API unreachable");

  // The backend speaks JSON. Anything else is not passed on, and the
  // response is always labelled JSON so it can never render as a page.
  const type = (upstream.headers.get("content-type") ?? "").toLowerCase();
  if (!type.includes("application/json")) {
    return reply(upstream.ok ? 502 : upstream.status, upstream.ok ? "API unreachable" : "Upstream error");
  }
  return new Response(upstream.body, { status: upstream.status, headers: JSON_HEADERS });
}

export { forward as GET, forward as POST };
