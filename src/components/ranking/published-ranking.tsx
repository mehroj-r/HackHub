import { RankingTable } from "@/components/ranking/ranking-table";
import { getEventRanking } from "@/lib/queries/ranking";

// The ranking section of /events/[eventId] (docs/08 > Event details > Ranking
// section). Render it only when results are published; before that the
// section isn't shown at all. Rank, team, members and total only: never
// per-criterion or per-judge scores (Decision 10).

type Props = {
  eventId: string;
  /** Signed-in viewers get member names linked to their profiles. */
  signedIn?: boolean;
  /** The viewer's team in this event, marked in the table. */
  viewerTeamId?: string;
};

export async function PublishedRanking({
  eventId,
  signedIn = false,
  viewerTeamId,
}: Props) {
  const { ranked } = await getEventRanking(eventId);

  return (
    <section aria-labelledby="ranking-heading" className="flex flex-col gap-4">
      <h2 id="ranking-heading" className="text-xl font-semibold">
        Final ranking
      </h2>
      {ranked.length === 0 ? (
        <p className="text-muted-foreground">No team submitted a project.</p>
      ) : (
        <RankingTable
          rows={ranked}
          linkMembers={signedIn}
          viewerTeamId={viewerTeamId}
        />
      )}
    </section>
  );
}
