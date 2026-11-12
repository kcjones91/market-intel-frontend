// Heat is a 0 to 100 activity score per company and theme. The backend's nightly
// heat job (app/workers/heat.py, backend v0.2.8 and later) calculates it from
// stored events and rewrites the last 12 days on every run. Its first run is what
// removes the seed rows the database was set up with.
//
// Sample data never appears as live data. This switch is true because the live
// backend runs that job. Do not deploy a build with it set to true against a
// backend whose heat job has not run: the stored rows would be seed values.
// Sample mode (no API configured) shows heat either way, under the site-wide
// SAMPLE DATA marker.
export const HEAT_IS_CALCULATED = true;

/** `live` is true when the page's data came from the API rather than the bundled sample data. */
export function heatVisible(live: boolean): boolean {
  return HEAT_IS_CALCULATED || !live;
}

/** Order for lists that used to sort by heat: most events today first, then by name. */
// Nothing validates the API response, so a missing field must not break the sort or the page.
export function byActivity<T extends { eventsToday: number; name: string }>(a: T, b: T): number {
  return (b.eventsToday ?? 0) - (a.eventsToday ?? 0) || (a.name ?? "").localeCompare(b.name ?? "", "en");
}
