// Generated artwork for events without a logo or banner. Everything is derived
// from the event name, so the same event always gets the same colours, and
// it's built from theme tokens only (docs/08 > Style guide). Pure functions:
// safe in server and client components, and unit tested.

/** FNV-1a, 32 bit, on the trimmed lower-cased name. Stable across runs and machines. */
export function nameHash(name: string): number {
  let hash = 0x811c9dc5;
  for (const char of name.trim().toLowerCase()) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Gradient presets in the Scoreboard hues (DESIGN.md): amber, live red, ember,
 * warm gold and deep brown. Full class strings, so Tailwind sees them. The
 * middle stop is always a bright hue, so the dark initials
 * (`text-primary-foreground`, #1A0E00) stay readable on the avatar.
 */
export const EVENT_GRADIENTS = [
  "bg-linear-to-br from-primary via-chart-4 to-chart-3",
  "bg-linear-to-tr from-chart-3 via-primary to-chart-4",
  "bg-linear-to-br from-live via-chart-3 to-primary",
  "bg-linear-to-bl from-chart-4 via-primary to-chart-5",
  "bg-linear-to-tr from-primary via-chart-3 to-live",
  "bg-linear-to-br from-chart-5 via-chart-3 to-primary",
  "bg-linear-to-tl from-chart-4 via-chart-3 to-chart-5",
  "bg-linear-to-r from-live via-primary to-chart-4",
] as const;

/** Pattern overlays for the banner fallback (see EventBanner). */
export const EVENT_PATTERNS = ["dots", "grid", "diagonal", "waves"] as const;
export type EventPattern = (typeof EVENT_PATTERNS)[number];

export type EventArt = {
  gradient: (typeof EVENT_GRADIENTS)[number];
  pattern: EventPattern;
};

/** The gradient and pattern for an event name. Same name, same art. */
export function eventArt(name: string): EventArt {
  // FNV's low bits barely change between similar names ("… Hack · live" and
  // "… Sprint" landed on the same preset), so mix them first (murmur3 fmix32).
  let hash = nameHash(name);
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35) >>> 0;
  hash = (hash ^ (hash >>> 16)) >>> 0;
  return {
    gradient: EVENT_GRADIENTS[hash % EVENT_GRADIENTS.length],
    // Different bits, so the pattern doesn't always follow the gradient.
    pattern: EVENT_PATTERNS[(hash >>> 8) % EVENT_PATTERNS.length],
  };
}

/**
 * Up to two initials for the avatar fallback: the first letter of the first
 * two words ("Open Hack · live" → "OH"), or the first two characters of a
 * single word ("Hackathon" → "HA"). Symbols are skipped.
 */
export function eventInitials(name: string): string {
  const words: string[] = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  const [first, second] = words;
  if (!first) return "?";
  const chars = second
    ? [...first].slice(0, 1).concat([...second].slice(0, 1))
    : [...first].slice(0, 2);
  return chars.join("").toUpperCase();
}
