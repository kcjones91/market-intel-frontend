// Turns the document address stored on an event into a link a reader can open.
//
// The backend stores the address it fetched the record from. For Congress
// items that is the data API (api.congress.gov/v3/...), which answers only
// with an API key and returns JSON, so it must never be shown as a reader
// link. Bills and resolutions map cleanly to their public congress.gov page.
//
// Stored addresses are untrusted. A link is rendered only for an http(s)
// address, with no embedded credentials or port, on a host readers should be
// sent to (see READER_DOMAINS below). Everything else is shown as plain text.

const BILL_SLUGS = new Map<string, string>([
  ["hr", "house-bill"],
  ["s", "senate-bill"],
  ["hjres", "house-joint-resolution"],
  ["sjres", "senate-joint-resolution"],
  ["hconres", "house-concurrent-resolution"],
  ["sconres", "senate-concurrent-resolution"],
  ["hres", "house-resolution"],
  ["sres", "senate-resolution"],
]);

// Hosts that serve machine data, not pages for readers.
const API_HOSTS = new Set(["api.congress.gov", "data.sec.gov", "api.govinfo.gov", "api.federalregister.gov", "api.data.gov"]);

// Reader links go only to the publishers the app ingests from (and their
// subdomains). A broader rule such as "any .gov site" would let a poisoned
// address ride an open redirect on some unrelated government site. Add a host
// here deliberately when a new source needs one.
const READER_DOMAINS = ["congress.gov", "sec.gov", "govinfo.gov", "federalregister.gov"];
const isReaderHost = (host: string) => READER_DOMAINS.some((d) => host === d || host.endsWith("." + d));

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  const last = n % 10;
  return `${n}${last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th"}`;
}

const wholeNumber = (s: string, max: number): number | null => {
  if (!/^\d{1,6}$/.test(s)) return null;
  const n = Number(s);
  return n >= 1 && n <= max ? n : null;
};

/** Public congress.gov page for a bill or resolution, or null if the parts are not valid. */
export function congressBillUrl(congress: string, type: string, number: string): string | null {
  const slug = BILL_SLUGS.get(type.toLowerCase());
  const c = wholeNumber(congress, 999);
  const n = wholeNumber(number, 99999);
  if (!slug || c === null || n === null) return null;
  return `https://www.congress.gov/bill/${ordinal(c)}-congress/${slug}/${n}`;
}

export interface SourceLink {
  /** Address to open, or null when there is nothing a reader should open. */
  href: string | null;
  /** Short text to show for the source. */
  label: string;
}

const pretty = (u: URL) => (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");

function linkTo(href: string): SourceLink {
  return { href, label: pretty(new URL(href)) };
}

/**
 * @param docUrl the event's stored document address
 * @param eventId the event id, used as a fallback for Congress items ("congress:119:hr:10006")
 */
export function sourceLink(docUrl: unknown, eventId?: unknown): SourceLink {
  const raw = (typeof docUrl === "string" ? docUrl : "").trim().slice(0, 2000);
  const id = typeof eventId === "string" ? eventId : "";

  let u: URL | null = null;
  try {
    u = new URL(raw);
  } catch {
    // not an absolute URL (sample data uses bare strings such as "sec.gov/edgar/RKLB/8-K")
  }
  if (!u) return { href: null, label: raw };

  const host = u.hostname.toLowerCase().replace(/\.$/, "");
  const web = u.protocol === "http:" || u.protocol === "https:";
  const clean = web && !u.username && !u.password && u.port === "";   // default ports only
  if (!clean) return { href: null, label: host || raw };

  if (API_HOSTS.has(host)) {
    // Congress bill, from the API address, then from the event id.
    const fromUrl = host === "api.congress.gov" ? u.pathname.match(/^\/v\d+\/bill\/(\d+)\/([a-z]+)\/(\d+)\/?$/i) : null;
    const fromId = id.match(/^congress:(\d+):([a-z]+):(\d+)$/i);
    for (const m of [fromUrl, fromId]) {
      const href = m ? congressBillUrl(m[1], m[2], m[3]) : null;
      if (href) return linkTo(href);
    }
    return { href: null, label: host.replace(/^(api|data)\./, "") };
  }

  if (isReaderHost(host)) return { href: u.href, label: pretty(u) };
  return { href: null, label: pretty(u) };
}
