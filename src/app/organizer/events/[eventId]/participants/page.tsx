import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ParticipantsTable } from "@/components/organizer/participants-table";
import { ParticipantsTabs } from "@/components/organizer/participants-tabs";
import { ParticipantsViewSkeleton } from "@/components/organizer/participants-view-skeleton";
import { Button } from "@/components/ui/button";

import { loadParticipants } from "./data";

// docs/08 > Participants and teams, the Participants tab (redesign: table +
// detail panel). The Teams tab is ./teams. loadParticipants() authorizes
// (organizer only) and loads the event; params, searchParams and the database
// are read inside this page's own Suspense (Cache Components). Search and the
// filters run in the browser over the event's registrations; ?q= still
// prefills the search.

export default function ParticipantsPage({
  params,
  searchParams,
}: PageProps<"/organizer/events/[eventId]/participants">) {
  return (
    <>
      <h2 className="text-section-title">Participants and teams</h2>
      <Suspense fallback={<ParticipantsViewSkeleton />}>
        <Participants params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Participants({
  params,
  searchParams,
}: Pick<
  PageProps<"/organizer/events/[eventId]/participants">,
  "params" | "searchParams"
>) {
  const { eventId } = await params;
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim();
  const { event, counts, rows } = await loadParticipants(eventId, "");

  return (
    <div className="mt-4 flex flex-col gap-6">
      <ParticipantsTabs
        eventId={eventId}
        current="participants"
        counts={counts}
      />
      {counts.participants === 0 ? (
        <EmptyState
          title="Nobody has registered yet."
          action={
            event.registrationOpen ? undefined : (
              <Button asChild variant="outline" className="h-11 md:h-9">
                <Link href={`/organizer/events/${eventId}`}>
                  Open registration on the overview
                </Link>
              </Button>
            )
          }
        >
          {event.registrationOpen
            ? "People who register for this event show up here."
            : "Registration is closed, so nobody can register yet."}
        </EmptyState>
      ) : (
        <ParticipantsTable rows={rows} initialQuery={query} />
      )}
    </div>
  );
}
