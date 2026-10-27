// Which state the submit page is in (docs/08 > Submit project). Pure: no
// Prisma or Next.js imports. Whether submitting is allowed at all is
// canSubmit() in event-state.ts; this only picks the page's message.
//
// The schema has one `submissionsOpen` switch, so "not opened yet" and
// "closed" look the same in the row. Submissions count as having been open
// once the event has any submission, its results are published, or its end
// date has passed.

import { isAfterLastDay } from "@/lib/domain/event-dates";

export type SubmissionPhase = "not-open" | "open" | "closed";

export function submissionPhase(input: {
  submissionsOpen: boolean;
  resultsPublished: boolean;
  /** Any team in the event has submitted. */
  eventHasSubmissions: boolean;
  /** The event's last day, stored as UTC midnight (a `@db.Date`). */
  endDate: Date;
  now: Date;
}): SubmissionPhase {
  if (input.resultsPublished) return "closed";
  if (input.submissionsOpen) return "open";
  if (input.eventHasSubmissions) return "closed";
  return isAfterLastDay(input.endDate, input.now) ? "closed" : "not-open";
}
