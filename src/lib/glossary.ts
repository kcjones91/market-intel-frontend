// One definition per term, used by every "?" on the site (components/Help.tsx).
// Keep these true to what the backend does: the thresholds below mirror
// _derive_priority in the backend's enrich worker, and the heat entry mirrors the
// defaults in the backend's heat worker (WINDOW_DAYS 7, HALF_LIFE_DAYS 2). Plain words, no advice.

export interface GlossaryEntry {
  title: string;
  body: string;
  points?: string[];
}

export const GLOSSARY = {
  importance: {
    title: "Importance",
    body:
      "A score from 0 to 100 for how much an event matters to the companies and themes this site tracks. " +
      "An automated model assigns it after reading the public record. Use it to decide what to read first. " +
      "It is not a rating of any company or stock.",
    points: ["80 to 100: high priority", "55 to 79: medium priority", "0 to 54: low priority"],
  },
  confidence: {
    title: "Confidence",
    body:
      "A score from 0 to 100 for how sure the scoring model is about its own reading of the event. " +
      "A short record, such as a bill title with no text, gives the model little to go on, so confidence is lower. " +
      "It does not say whether an event is good or bad for anyone.",
  },
  priority: {
    title: "Priority",
    body: "The group an event is placed in on this page. It comes only from the event's importance score.",
    points: ["High: importance 80 or more", "Medium: importance 55 to 79", "Low: importance under 55"],
  },
  heat: {
    title: "Heat",
    body:
      "A score from 0 to 100 for how much is happening around a company or theme. " +
      "It is recalculated every night from the events linked to that name over the last 7 days. " +
      "More important events count for much more, and an event counts for half as much every 2 days. " +
      "Events the scoring model has not read yet are left out. " +
      "Heat measures activity only. It does not say whether that activity is good or bad for anyone.",
    points: ["Counts events from the last 7 days", "An event's weight halves every 2 days", "Updated once a night"],
  },
} satisfies Record<string, GlossaryEntry>;

export type Term = keyof typeof GLOSSARY;
