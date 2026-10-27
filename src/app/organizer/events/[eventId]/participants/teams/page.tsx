import { Suspense } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ParticipantsTabs } from "@/components/organizer/participants-tabs";
import { ParticipantsViewSkeleton } from "@/components/organizer/participants-view-skeleton";
import { TeamsTable } from "@/components/organizer/teams-table";

import { loadTeams } from "../data";

// docs/08 > Participants and teams, the Teams tab (redesign: table + detail
// panel). loadTeams() authorizes (organizer only) and loads the event; params
// and the database are read inside this page's own Suspense (Cache
// Components).

export default function TeamsPage({
  params,
}: PageProps<"/organizer/events/[eventId]/participants/teams">) {
  return (
    <>
      <h2 className="text-section-title">Participants and teams</h2>
      <Suspense fallback={<ParticipantsViewSkeleton />}>
        <Teams params={params} />
      </Suspense>
    </>
  );
}

async function Teams({
  params,
}: Pick<
  PageProps<"/organizer/events/[eventId]/participants/teams">,
  "params"
>) {
  const { eventId } = await params;
  const { event, counts, rows } = await loadTeams(eventId);

  return (
    <div className="mt-4 flex flex-col gap-6">
      <ParticipantsTabs eventId={eventId} current="teams" counts={counts} />
      {rows.length === 0 ? (
        // Teams form by themselves, so there's no action to offer.
        <EmptyState title="No teams yet.">
          Teams that participants create or join show up here.
        </EmptyState>
      ) : (
        <TeamsTable rows={rows} maxTeamSize={event.maxTeamSize} />
      )}
    </div>
  );
}
