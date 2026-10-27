// The one-word phase of an event, for the current-event chip, the event page
// rail and the organizer command centre (redesign plan > App shell). Pure:
// derived from the switches the event already has; no schema change.

export type EventPhase =
  | "upcoming"
  | "registration"
  | "building"
  | "judging"
  | "results";

export const PHASE_LABEL: Record<EventPhase, string> = {
  upcoming: "Not open yet",
  registration: "Registration open",
  building: "Submissions open",
  judging: "Judging",
  results: "Results published",
};

/**
 * "Live" phases get the red live dot (DESIGN.md > Rules: red means live);
 * the rest a quiet dot.
 */
export function isLivePhase(phase: EventPhase): boolean {
  return phase === "registration" || phase === "building";
}

export type PhaseFlags = {
  registrationOpen: boolean;
  submissionsOpen: boolean;
  resultsPublished: boolean;
  /** Whether any team has submitted; tells "judging" from "upcoming". */
  hasSubmissions?: boolean;
};

/**
 * Results beat everything; then open submissions (teams are building), then
 * open registration. With both switches closed, an event with submissions is
 * being judged; one without any hasn't started.
 */
export function eventPhase(event: PhaseFlags): EventPhase {
  if (event.resultsPublished) return "results";
  if (event.submissionsOpen) return "building";
  if (event.registrationOpen) return "registration";
  return event.hasSubmissions ? "judging" : "upcoming";
}
