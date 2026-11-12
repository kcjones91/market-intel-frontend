// API client.
//
// Server components call the backend directly, using API_INTERNAL_URL (read at
// runtime, e.g. the in-cluster Service address). NEXT_PUBLIC_API_URL is still
// honored as a fallback so local dev with .env.local keeps working.
//
// Browser code never talks to the backend directly. It calls same-origin
// /api/*, which src/app/api/[...path]/route.ts forwards to the backend. That
// way no backend address is baked into the bundle and nothing breaks when the
// app is opened from outside the LAN.
//
// Return contract for every call:
//   data  -> the API answered
//   null  -> no API is configured (standalone sample mode). For the single
//            record calls (company, theme, event) null also means the API
//            said 404: pair it with `apiEnabled` to tell the two apart.
//   throw -> an API is configured but failed, including a 404 on a list or
//            feed endpoint (wrong base path, renamed route). Views must NOT
//            fall back to sample data in that case: showing sample data as
//            if it were live is worse than showing an error.

import type {
  Company, Theme, GovBody, IntelEvent, GraphNode, Edge, AlertRule, TriggeredAlert,
} from "@/lib/types";

export interface Quote { sym: string; px: string; chg: string; d: number }
export interface DashboardData {
  date: string;
  stamp: string;
  ingestSummary: string;
  quotes: Quote[];
  high: IntelEvent[];
  med: IntelEvent[];
  low: IntelEvent[];
}
export interface CompanyDetail { company: Company; timeline: IntelEvent[]; government: GovBody[] }
export interface ThemeDetail { theme: Theme; companies: Company[]; government: GovBody[]; events: IntelEvent[] }
export interface EventDetail { event: IntelEvent; related: IntelEvent[] }
export interface GraphData { nodes: GraphNode[]; edges: Edge[] }
export interface AlertsData { triggered: TriggeredAlert[]; rules: AlertRule[] }

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

const isServer = typeof window === "undefined";

const SERVER_BASE = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/** True when a backend is configured. Only meaningful in server components. */
export const apiEnabled = Boolean(SERVER_BASE);

async function request<T>(path: string, init?: RequestInit, notFoundIsNull = false): Promise<T | null> {
  let url: string;
  if (isServer) {
    if (!SERVER_BASE) return null;          // mock mode
    url = `${SERVER_BASE}${path}`;
  } else {
    url = path;                             // same-origin, proxied
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      cache: "no-store",
      redirect: "error",                                       // the backend never redirects; do not follow one elsewhere
      signal: isServer ? AbortSignal.timeout(10_000) : undefined,
    });
  } catch {
    throw new ApiError(`API unreachable: ${path}`);
  }
  if (!isServer && res.status === 501) return null;   // proxy reports: no API configured
  if (res.status === 404 && notFoundIsNull) return null;
  if (!res.ok) throw new ApiError(`API error ${res.status}: ${path}`, res.status);
  return (await res.json()) as T;
}

const get = <T,>(path: string) => request<T>(path);
/** For one record by id: a 404 means "no such record", not a failure. */
const getOne = <T,>(path: string) => request<T>(path, undefined, true);
const post = <T,>(path: string, body: unknown) =>
  request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const enc = encodeURIComponent;

export const api = {
  today: () => get<DashboardData>("/api/today"),
  companies: () => get<Company[]>("/api/companies"),
  company: (id: string) => getOne<CompanyDetail>(`/api/companies/${enc(id)}`),
  themes: () => get<Theme[]>("/api/themes"),
  theme: (id: string) => getOne<ThemeDetail>(`/api/themes/${enc(id)}`),
  government: () => get<GovBody[]>("/api/government"),
  event: (id: string) => getOne<EventDetail>(`/api/events/${enc(id)}`),
  graph: () => get<GraphData>("/api/graph"),
  search: (q: string) => post<IntelEvent[]>("/api/search", { q, limit: 20 }),

  // /api/alerts has no response_model on the backend, so its exact key names
  // are not pinned by a schema. Accept the likely spellings and normalize.
  alerts: async (): Promise<AlertsData | null> => {
    const raw = await get<any>("/api/alerts");
    if (!raw) return null;
    const fired: any[] = raw.triggered ?? raw.fired ?? raw.triggeredAlerts ?? raw.triggered_alerts ?? [];
    const rules: any[] = raw.rules ?? raw.alertRules ?? raw.alert_rules ?? [];
    return {
      triggered: fired.map((a) => ({
        id: String(a.id),
        ruleName: a.ruleName ?? a.rule_name ?? "",
        hit: a.hit ?? "",
        ref: a.ref ?? undefined,
        time: a.time ?? "",
      })),
      rules: rules.map((r) => ({
        id: String(r.id),
        name: r.name ?? "",
        scopeKind: r.scopeKind ?? r.scope_kind,
        scopeValue: r.scopeValue ?? r.scope_value ?? "",
        channels: r.channels ?? [],
        enabled: Boolean(r.enabled),
      })),
    };
  },
};

/** All of today's events in one list (high, then med, then low). */
export function allEvents(d: DashboardData | null): IntelEvent[] {
  return d ? [...d.high, ...d.med, ...d.low] : [];
}
