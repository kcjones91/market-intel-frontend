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
const BODY_READ_TIMEOUT_MS = 5_000;
const UPSTREAM_TIMEOUT_MS = 10_000;

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
  "cache-control": "no-store",
};

function reply(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), { status, headers: JSON_HEADERS });
}

/** Reads the request body, giving up as soon as it passes the size limit or takes too long. */
async function readLimited(req: Request): Promise<string | "too-large" | "too-slow"> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return "too-large";
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; reader.cancel().catch(() => {}); }, BODY_READ_TIMEOUT_MS);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (timedOut) return "too-slow";
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        return "too-large";
      }
      chunks.push(value);
    }
  } catch {
    return timedOut ? "too-slow" : "too-large";
  } finally {
    clearTimeout(timer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Checks the request path against the allowlist and returns the path to send
 * upstream, or null. Segments are decoded before matching (so an encoded id
 * such as "sec%3A1045810%3A..." is accepted) and re-encoded for the backend.
 */
function upstreamPath(pathname: string, allowed: RegExp[]): string | null {
  let decoded: string[];
  try {
    decoded = pathname.split("/").map((seg) => decodeURIComponent(seg));
  } catch {
    return null;
  }
  if (decoded.some((seg) => seg === "." || seg === ".." || seg.includes("/") || seg.includes("\\"))) return null;
  if (!allowed.some((re) => re.test(decoded.join("/")))) return null;
  return decoded.map((seg) => encodeURIComponent(seg)).join("/");
}

async function forward(req: Request): Promise<Response> {
  if (!BASE) {
    // No backend configured: tell the client so it can use bundled sample data.
    return reply(501, "API not configured");
  }

  const isPost = req.method === "POST";
  const path = upstreamPath(new URL(req.url).pathname, isPost ? ALLOWED_POST : ALLOWED_GET);
  if (!path) return reply(404, "Not found");

  const init: RequestInit = {
    method: isPost ? "POST" : "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    redirect: "manual",                                   // never follow the backend somewhere else
  };

  if (isPost) {
    const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (type !== "application/json") return reply(415, "Expected application/json");
    const body = await readLimited(req);
    if (body === "too-large") return reply(413, "Request body too large");
    if (body === "too-slow") return reply(408, "Request body took too long");
    init.body = body;
  }

  let upstream: Response;
  try {
    // The UI sends no query strings, so none are forwarded. The timeout starts here, after the body is in hand.
    upstream = await fetch(`${BASE}${path}`, { ...init, signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  } catch {
    return reply(502, "API unreachable");
  }

  if (upstream.status >= 300 && upstream.status < 400) return reply(502, "API unreachable");

  // The backend speaks JSON. Anything else is not passed on, and the
  // response is always labelled JSON so it can never render as a page.
  const type = (upstream.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") {
    return reply(upstream.ok ? 502 : upstream.status, upstream.ok ? "API unreachable" : "Upstream error");
  }
  return new Response(upstream.body, { status: upstream.status, headers: JSON_HEADERS });
}

export { forward as GET, forward as POST };
