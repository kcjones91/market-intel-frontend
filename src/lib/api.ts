// API client. When NEXT_PUBLIC_API_URL is set, views fetch from the backend.
// When it's unset (or a fetch fails), they fall back to the bundled mock data,
// so the frontend always runs standalone.

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const usingApi = Boolean(BASE);

async function get<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function post<T>(path: string, body: unknown): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const api = {
  today: () => get<any>("/api/today"),
  companies: () => get<any[]>("/api/companies"),
  company: (id: string) => get<any>(`/api/companies/${id}`),
  themes: () => get<any[]>("/api/themes"),
  theme: (id: string) => get<any>(`/api/themes/${id}`),
  government: () => get<any[]>("/api/government"),
  event: (id: string) => get<any>(`/api/events/${id}`),
  graph: () => get<any>("/api/graph"),
  search: (q: string) => post<any[]>("/api/search", { q, limit: 20 }),
  alerts: () => get<any>("/api/alerts"),
};
