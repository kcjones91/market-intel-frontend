// One definition per term, used by every "?" on the site (components/Help.tsx).
// Keep these true to what the backend does: the thresholds below mirror
// _derive_priority in the backend's enrich worker. Plain words, no advice.

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
      "A score from 0 to 100 for how much is happening around a company or theme: how many events, how important they are and how recent. " +
      "Heat is not calculated from live data yet, so the live site does not show it. Any heat you see is sample data.",
  },
  theme: {
    title: "Theme",
    body:
      "A topic the site follows across companies and government activity. Each event is tagged with the themes it touches, " +
      "so a theme page gathers everything related in one place.",
  },
} satisfies Record<string, GlossaryEntry>;

export type Term = keyof typeof GLOSSARY;
