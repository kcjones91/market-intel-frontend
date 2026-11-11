// Core object model for Market Intel. These types are the contract every view reads from,
// and they mirror what the Pydantic/Postgres layer will formalize later.

export type Priority = "high" | "med" | "low";
export type SourceType =
  | "SEC" | "CONGRESS" | "FED_REGISTER" | "DOE" | "DARPA" | "NASA"
  | "USPTO" | "HIRING" | "NEWS" | "EXEC";

export type EntityKind = "company" | "executive" | "theme" | "govbody";

export interface Company {
  id: string;
  name: string;
  ticker?: string;
  sector: string;
  themes: string[];      // theme ids
  watched: boolean;
  heat: number;          // current intelligence score 0-100
  heatTrend: number[];   // recent daily heat snapshots
  eventsToday: number;
}

export interface Executive {
  id: string;
  name: string;
  role: string;
  companyId: string;
}

export interface Theme {
  id: string;
  name: string;
  heat: number;
  heatTrend: number[];
  eventsToday: number;
}

export type GovKind = "bill" | "hearing" | "funding" | "contract" | "grant" | "solicitation";
export interface GovBody {
  id: string;
  kind: GovKind;
  agency: string;        // DOE, DARPA, Congress...
  ref: string;           // HR-4871, DOE-2026-0142...
  title: string;
  status: string;
  affects: string[];     // company ids
  themes: string[];      // theme ids
}

export interface EventEntity { kind: EntityKind; id: string; label: string; }

export interface IntelEvent {
  id: string;
  source: SourceType;
  sourceLabel: string;   // "CONGRESS.GOV"
  docType: string;       // "HR-4871", "FORM 8-K"
  priority: Priority;
  importance: number;    // 0-100
  confidence: number;    // 0-100
  time: string;          // "06:15"
  date: string;          // ISO
  title: string;
  summary: string;
  companies: string[];   // company ids
  themes: string[];      // theme ids
  entities: EventEntity[];
  docUrl: string;
}

export type EdgeType = "funds" | "contracts" | "employs" | "co_occurs" | "partners" | "tags";
export interface Edge { a: string; b: string; type: EdgeType; }

export interface GraphNode { id: string; label: string; kind: EntityKind; }

export type AlertChannel = "discord" | "email" | "slack" | "telegram";
export interface AlertRule {
  id: string;
  name: string;
  scopeKind: "company" | "theme" | "agency" | "keyword" | "executive" | "legislation" | "importance";
  scopeValue: string;
  channels: AlertChannel[];
  enabled: boolean;
}
export interface TriggeredAlert {
  id: string;
  ruleName: string;
  hit: string;
  ref?: { kind: "event" | "company" | "theme"; id: string };
  time: string;
}

export interface Region {
  id: string;
  name: string;
  impacts: string[];     // theme ids
  eventIds: string[];
}
