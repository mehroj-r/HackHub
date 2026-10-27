import type { EventState } from "@/lib/domain/event-state";

// The organizer's switches on the event overview (docs/08 > Event overview,
// docs/02 > Publishing, Decisions 2 and 3). Pure functions: no Prisma or
// Next.js imports. Each returns the reason a change is refused, in the UI
// spec's words, or null when it's allowed. The page shows the reason next to
// the disabled control; the action throws it as a RuleError.

export const SWITCH_MESSAGES = {
  published: "Results are published, so this event can't change any more.",
  scoringStarted: "Judges have started scoring, so submissions can't reopen.",
  submissionsOpen: "Close submissions first.",
  noCriteria: "Set the judging criteria first.",
  noSubmissions:
    "You can publish once at least one team has submitted and submissions are closed.",
} as const;

/** The criteria are set once they exist and their weights total exactly 100% (Decision 6). */
export function criteriaAreSet(criteria: { weightPercent: number }[]) {
  return (
    criteria.length > 0 &&
    criteria.reduce((sum, c) => sum + c.weightPercent, 0) === 100
  );
}

/** "Not set", "Set: weights total 100%" or "Locked" (any score exists, Decision 6). */
export function criteriaStatus(
  criteria: { weightPercent: number }[],
  scoreCount: number,
) {
  if (!criteriaAreSet(criteria)) return "Not set";
  return scoreCount > 0 ? "Locked" : "Set: weights total 100%";
}

/** Registration can open or close until results are published. */
export function registrationBlocker(
  event: Pick<EventState, "resultsPublished">,
): string | null {
  return event.resultsPublished ? SWITCH_MESSAGES.published : null;
}

/**
 * Submissions can open or close until results are published, but can't reopen
 * once any score exists for the event: judges score closed submissions only.
 */
export function submissionsBlocker(
  event: Pick<EventState, "resultsPublished">,
  open: boolean,
  scoreCount: number,
): string | null {
  if (event.resultsPublished) return SWITCH_MESSAGES.published;
  if (open && scoreCount > 0) return SWITCH_MESSAGES.scoringStarted;
  return null;
}

/**
 * Publishing happens once (Decision 3) and needs submissions closed *after*
 * teams submitted, and the criteria set. "Closed" alone isn't enough: before
 * submissions ever open they're closed too, and publishing then would lock an
 * empty ranking for good. Unscored teams are a warning on the page, not a
 * block here.
 */
export function publishBlocker(
  event: Pick<EventState, "submissionsOpen" | "resultsPublished">,
  criteria: { weightPercent: number }[],
  /** Whether any team in the event has submitted (submissionPhase's eventHasSubmissions). */
  hasSubmissions: boolean,
): string | null {
  if (event.resultsPublished) return SWITCH_MESSAGES.published;
  if (event.submissionsOpen) return SWITCH_MESSAGES.submissionsOpen;
  if (!hasSubmissions) return SWITCH_MESSAGES.noSubmissions;
  if (!criteriaAreSet(criteria)) return SWITCH_MESSAGES.noCriteria;
  return null;
}
