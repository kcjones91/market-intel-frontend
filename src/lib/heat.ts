// Heat is meant to be a 0 to 100 activity score per company and theme, written
// nightly by the backend. That job does not exist yet: the heat rows in the
// live database are the seed rows from the day it was set up, so they are
// sample values with a real-looking date.
//
// Sample data never appears as live data, so live pages do not show heat until
// the backend calculates it. Sample mode (no API configured) still shows it,
// under the site-wide SAMPLE DATA marker.
//
// Set this to true in the release that ships the backend heat job.
export const HEAT_IS_CALCULATED = false;

/** `live` is true when the page's data came from the API rather than the bundled sample data. */
export function heatVisible(live: boolean): boolean {
  return HEAT_IS_CALCULATED || !live;
}

/** Order for lists that used to sort by heat: most events today first, then by name. */
export function byActivity<T extends { eventsToday: number; name: string }>(a: T, b: T): number {
  return b.eventsToday - a.eventsToday || a.name.localeCompare(b.name);
}
