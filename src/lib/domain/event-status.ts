import { isAfterLastDay } from "@/lib/domain/event-dates";
import { eventPhase, type PhaseFlags } from "@/lib/domain/event-phase";

// The filter tabs on "Events I run" (/organizer): which group an event falls
// in. Pure: no Prisma or Next.js imports. Built on the shared eventPhase(), so
// the tabs agree with the event chip and the command centre:
//
// - Live: registration or submissions open.
// - Upcoming: not open yet, and its last day hasn't passed (GMT+5).
// - Judging: submissions closed after teams submitted, results not out.
// - Finished: results published, or never opened and its last day is over.
//   Past-dated events that never opened would otherwise sit in "Upcoming".

export type EventStatus = "live" | "upcoming" | "judging" | "finished";
export type StatusFilter = "all" | EventStatus;

export const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "judging", label: "Judging" },
  { value: "finished", label: "Finished" },
];

export type StatusInput = PhaseFlags & { endDate: Date };

export function eventStatus(event: StatusInput, now: Date): EventStatus {
  const phase = eventPhase(event);
  if (phase === "registration" || phase === "building") return "live";
  if (phase === "judging") return "judging";
  if (phase === "results") return "finished";
  return isAfterLastDay(event.endDate, now) ? "finished" : "upcoming";
}

/** The ?status= value, or "all" for anything missing or unknown. */
export function parseStatusFilter(value: unknown): StatusFilter {
  const v = Array.isArray(value) ? value[0] : value;
  return STATUS_TABS.some((t) => t.value === v) ? (v as StatusFilter) : "all";
}

const GROUP_ORDER: Record<EventStatus, number> = {
  live: 0,
  upcoming: 1,
  judging: 2,
  finished: 3,
};

/**
 * The list order: Live, Upcoming, Judging, Finished. Within a group by start
 * date: Live and Upcoming soonest first; Judging and Finished latest first.
 * Ties fall back to the name, so the order is stable.
 */
export function compareByStatus(
  a: { status: EventStatus; startDate: Date; name: string },
  b: { status: EventStatus; startDate: Date; name: string },
): number {
  const group = GROUP_ORDER[a.status] - GROUP_ORDER[b.status];
  if (group !== 0) return group;
  const ascending = a.status === "live" || a.status === "upcoming";
  const byStart = a.startDate.getTime() - b.startDate.getTime();
  if (byStart !== 0) return ascending ? byStart : -byStart;
  return a.name.localeCompare(b.name);
}
