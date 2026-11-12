// Turns the document address stored on an event into a link a reader can open.
//
// The backend stores the address it fetched the record from. For Congress
// items that is the data API (api.congress.gov/v3/...), which answers only
// with an API key and returns JSON, so it must never be shown as a reader
// link. Bills and resolutions map cleanly to their public congress.gov page.
// Anything on an API host that cannot be mapped gets no link at all.

const BILL_SLUGS: Record<string, string> = {
  hr: "house-bill",
  s: "senate-bill",
  hjres: "house-joint-resolution",
  sjres: "senate-joint-resolution",
  hconres: "house-concurrent-resolution",
  sconres: "senate-concurrent-resolution",
  hres: "house-resolution",
  sres: "senate-resolution",
};

// Hosts that serve machine data, not pages for readers.
const API_HOSTS = new Set(["api.congress.gov", "data.sec.gov", "api.govinfo.gov", "api.federalregister.gov"]);

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  const last = n % 10;
  return `${n}${last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th"}`;
}

/** Public congress.gov page for a bill or resolution, or null if the parts are not valid. */
export function congressBillUrl(congress: string, type: string, number: string): string | null {
  const slug = BILL_SLUGS[type.toLowerCase()];
  const c = Number(congress);
  const n = Number(number);
  if (!slug || !Number.isInteger(c) || c < 1 || !Number.isInteger(n) || n < 1) return null;
  return `https://www.congress.gov/bill/${ordinal(c)}-congress/${slug}/${n}`;
}

export interface SourceLink {
  /** Address to open, or null when there is nothing a reader can open. */
  href: string | null;
  /** Short text to show for the source. */
  label: string;
}

/**
 * @param docUrl the event's stored document address
 * @param eventId the event id, used as a fallback for Congress items ("congress:119:hr:10006")
 */
export function sourceLink(docUrl: string | null | undefined, eventId?: string): SourceLink {
  const raw = (docUrl ?? "").trim();

  // Congress bill, from the API address.
  const api = raw.match(/^https?:\/\/api\.congress\.gov\/v\d+\/bill\/(\d+)\/([a-z]+)\/(\d+)(?:[/?#]|$)/i);
  if (api) {
    const href = congressBillUrl(api[1], api[2], api[3]);
    if (href) return { href, label: href.replace(/^https:\/\/www\./, "") };
  }

  let host = "";
  let web = false;
  try {
    const u = new URL(raw);
    host = u.hostname.toLowerCase();
    web = u.protocol === "http:" || u.protocol === "https:";
  } catch {
    // not an absolute URL (mock data uses bare strings such as "sec.gov/edgar/RKLB/8-K")
  }

  if (web && API_HOSTS.has(host)) {
    // Fall back to the event id for Congress items the pattern above did not match.
    const id = (eventId ?? "").match(/^congress:(\d+):([a-z]+):(\d+)$/i);
    const href = id ? congressBillUrl(id[1], id[2], id[3]) : null;
    if (href) return { href, label: href.replace(/^https:\/\/www\./, "") };
    return { href: null, label: host.replace(/^(api|data)\./, "") };
  }

  if (web) return { href: raw, label: raw.replace(/^https?:\/\/(www\.)?/, "") };
  return { href: null, label: raw };
}
