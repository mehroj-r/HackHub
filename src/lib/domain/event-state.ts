// What an event allows in its current state (docs/07 > lib/domain, docs/02
// Decisions 2 and 5). Pure functions: no Prisma or Next.js imports. Actions
// call these inside their transaction instead of re-implementing a rule.

/** The event switches these rules read. A Prisma `Event` row fits. */
export type EventState = {
  registrationOpen: boolean;
  submissionsOpen: boolean;
  resultsPublished: boolean;
};

/** Participants can register while registration is open. */
export function canRegister(event: Pick<EventState, "registrationOpen">) {
  return event.registrationOpen;
}

/** Teams can submit or edit while submissions are open and results aren't published. */
export function canSubmit(
  event: Pick<EventState, "submissionsOpen" | "resultsPublished">,
) {
  return event.submissionsOpen && !event.resultsPublished;
}

/** Judges score once submissions are closed, until results are published (Decision 2). */
export function canScore(
  event: Pick<EventState, "submissionsOpen" | "resultsPublished">,
) {
  return !event.submissionsOpen && !event.resultsPublished;
}

/** Shown on the public /events list while registration is open (Decision 5). */
export function isListed(event: Pick<EventState, "registrationOpen">) {
  return event.registrationOpen;
}

/** An event may start and end on the same day; the end can't be before the start. */
export function validateEventDates(start: Date, end: Date) {
  return end.getTime() >= start.getTime();
}
