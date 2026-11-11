// Same-origin proxy: the browser calls /api/* on this app, and this handler
// forwards the request to the backend named by API_INTERNAL_URL at runtime.
//
// Only GET and POST are forwarded, which covers every endpoint the backend has
// today (reads plus POST /api/search). When write endpoints are added to the
// backend, put authentication in front of this before exposing them.

export const dynamic = "force-dynamic";

const BASE = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

async function forward(req: Request): Promise<Response> {
  if (!BASE) {
    // No backend configured: tell the client so it can use bundled mock data.
    return Response.json({ error: "API not configured" }, { status: 501 });
  }

  const { pathname, search } = new URL(req.url);
  const init: RequestInit = {
    method: req.method,
    headers: { "content-type": req.headers.get("content-type") ?? "application/json" },
    cache: "no-store",
  };
  if (req.method === "POST") init.body = await req.text();

  try {
    const upstream = await fetch(`${BASE}${pathname}${search}`, init);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json({ error: "API unreachable" }, { status: 502 });
  }
}

export { forward as GET, forward as POST };
