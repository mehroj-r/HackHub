import type * as React from "react";

import { RankingTable } from "@/components/ranking/ranking-table";
import type { EventRanking } from "@/lib/queries/ranking";

// The organizer's ranking preview (docs/08 > Ranking preview, O5). The page
// loads the ranking with getEventRanking() and handles the "Not ready" state
// (submissions open or no criteria) before rendering this. The judge count
// per team supports the manual review before publishing.

type Props = {
  ranking: EventRanking;
  /** Slot for the "Publish results" button, which belongs to #12. */
  actions?: React.ReactNode;
};

export function RankingPreviewTable({ ranking, actions }: Props) {
  const { ranked, unranked, scoreCount } = ranking;

  return (
    <div className="flex flex-col gap-4">
      {scoreCount === 0 && (
        <p className="text-muted-foreground">No scores yet.</p>
      )}

      {ranked.length > 0 ? (
        <RankingTable rows={ranked} linkMembers showJudgeCount />
      ) : (
        <p className="text-muted-foreground">
          No team has submitted a project.
        </p>
      )}

      {unranked.length > 0 && (
        <p className="text-sm">
          <span className="font-medium">Not ranked (no submission):</span>{" "}
          {unranked.map((team) => team.name).join(", ")}
        </p>
      )}

      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        <li>A criterion nobody scored counts as 0 for that team.</li>
        <li>Ties are broken by the highest-weight criterion, then the next.</li>
      </ul>

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
