import Link from "next/link";

import { PublishResultsButton } from "@/components/organizer/publish-results-button";
import { RankingPreviewTable } from "@/components/ranking/ranking-preview-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { requireEvent, requireRole } from "@/lib/auth/dal";
import { criteriaAreSet, publishBlocker } from "@/lib/domain/event-switches";
import { getEventRanking } from "@/lib/queries/ranking";

import { publishResults } from "../actions";

// The organizer's ranking preview (docs/08 > Ranking preview, O5, #16): the
// same table as the published ranking plus a judge count per team, for the
// manual review before publishing (docs/02 > Consequences of the cuts). The
// event layout shows the name, badges and sub-nav above it, and the area's
// loading.tsx provides the Suspense boundary.

export default async function RankingPreviewPage({
  params,
}: PageProps<"/organizer/events/[eventId]/ranking">) {
  await requireRole("ORGANIZER");
  const { eventId } = await params;
  const event = await requireEvent(eventId);
  const ranking = await getEventRanking(eventId);

  const published = event.resultsPublished;
  const notReady =
    !published && (event.submissionsOpen || !criteriaAreSet(ranking.criteria));

  return (
    <section aria-labelledby="ranking-preview" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 id="ranking-preview" className="text-2xl font-semibold">
          Ranking preview
        </h2>
        <p className="text-muted-foreground text-sm">
          Check that every team has been scored before you publish. Only you and
          other organizers see this page.
        </p>
      </div>

      {published && (
        <Alert>
          <AlertTitle>Results were published.</AlertTitle>
          <AlertDescription>
            <p>
              Everyone can see the ranking on the{" "}
              <Link
                href={`/events/${eventId}`}
                className="text-foreground underline underline-offset-4"
              >
                public event page
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>
      )}

      {notReady ? (
        <Alert>
          <AlertDescription>
            The ranking appears once submissions are closed and criteria are
            set.
          </AlertDescription>
        </Alert>
      ) : (
        <RankingPreviewTable
          ranking={ranking}
          actions={
            // Stays mounted (disabled) after publishing, so its
            // "Results published." toast still shows.
            <PublishResultsButton
              eventName={event.name}
              rankingHref={`/organizer/events/${eventId}/ranking`}
              disabled={published}
              disabledReason={
                published ? null : publishBlocker(event, ranking.criteria)
              }
              action={publishResults.bind(null, eventId)}
            />
          }
        />
      )}
    </section>
  );
}
