// Liveness/readiness for the frontend itself. Deliberately does not touch the
// backend: if the API is down the frontend should stay up and show an error,
// not get pulled out of the Service.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", service: "market-intel-frontend" });
}
