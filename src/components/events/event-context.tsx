import { Suspense } from "react";

import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { EventChip, EventChipSkeleton } from "@/components/layout/event-chip";
import { ProgressRail } from "@/components/layout/progress-rail";
import type { EventPhase } from "@/lib/domain/event-phase";
import {
  participantProgress,
  type ParticipantFlags,
} from "@/lib/domain/participant-progress";

// The top of every participant page inside an event (redesign > App shell,
// Participant progress): the breadcrumb trail and the current-event chip on
// one line, then the 4-step progress rail for participants. The event page,
// the team page and the submit page all start with it.

export function EventContext({
  event,
  phase,
  crumbs,
  participant,
}: {
  event: { id: string; name: string; logoPath: string | null };
  phase: EventPhase;
  /** The trail after "Events › {event}"; empty on the event page itself. */
  crumbs: BreadcrumbItem[];
  /** Participants only: their standing, for the progress rail. */
  participant: ParticipantFlags | null;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Events", href: "/events" },
    crumbs.length
      ? { label: event.name, href: `/events/${event.id}` }
      : { label: event.name },
    ...crumbs,
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Breadcrumbs items={items} />
        <Suspense fallback={<EventChipSkeleton />}>
          <EventChip
            event={{
              id: event.id,
              name: event.name,
              logoPath: event.logoPath,
              phase,
            }}
          />
        </Suspense>
      </div>
      {participant && (
        <ProgressRail steps={participantProgress(event.id, participant)} />
      )}
    </div>
  );
}
