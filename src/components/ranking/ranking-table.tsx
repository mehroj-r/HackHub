import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankedTeam } from "@/lib/domain/ranking";
import type { RankingMember, RankingTeam } from "@/lib/queries/ranking";
import { cn } from "@/lib/utils";

// The ranking table shared by the public event page and the organizer
// preview (docs/08 > Ranking section, Ranking preview). Desktop gets a table;
// below md each team becomes a stacked item with rank and total side by side.

type Props = {
  rows: RankedTeam<RankingTeam>[];
  /** Link member names to their profiles (signed-in viewers only). */
  linkMembers: boolean;
  /** The viewer's own team, marked with a badge and not by colour alone. */
  viewerTeamId?: string;
  /** Organizer preview: also show how many judges scored each team. */
  showJudgeCount?: boolean;
};

function formatTotal(total: number) {
  return total.toFixed(1);
}

function Members({
  members,
  linkMembers,
}: {
  members: RankingMember[];
  linkMembers: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {members.map((m) => {
        const name = m.name ?? "No name yet";
        return (
          <li key={m.userId}>
            {linkMembers ? (
              <Link
                href={`/profile/${m.userId}`}
                className="underline-offset-4 hover:underline focus-visible:underline"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </li>
        );
      })}
    </ul>
  );
}

function YourTeam() {
  return (
    <Badge variant="secondary" className="ml-2">
      Your team
    </Badge>
  );
}

export function RankingTable({
  rows,
  linkMembers,
  viewerTeamId,
  showJudgeCount = false,
}: Props) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Members</TableHead>
              {showJudgeCount && (
                <TableHead className="text-right">Judges</TableHead>
              )}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const mine = row.team.id === viewerTeamId;
              return (
                <TableRow
                  key={row.team.id}
                  aria-current={mine ? "true" : undefined}
                  className={cn(mine && "bg-muted/50")}
                >
                  <TableCell className="font-semibold tabular-nums">
                    {row.rank}
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.team.name}
                    {mine && <YourTeam />}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Members
                      members={row.team.members}
                      linkMembers={linkMembers}
                    />
                  </TableCell>
                  {showJudgeCount && (
                    <TableCell className="text-right tabular-nums">
                      {row.judgeCount}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatTotal(row.total)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ol className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => {
          const mine = row.team.id === viewerTeamId;
          return (
            <li
              key={row.team.id}
              aria-current={mine ? "true" : undefined}
              className={cn(
                "flex flex-col gap-2 rounded-lg border p-3",
                mine && "border-primary bg-muted/50",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold tabular-nums">
                  <span className="sr-only">Rank </span>#{row.rank}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatTotal(row.total)}
                  <span className="text-muted-foreground"> / 100</span>
                </span>
              </div>
              <div className="font-medium">
                {row.team.name}
                {mine && <YourTeam />}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Members: </span>
                <Members members={row.team.members} linkMembers={linkMembers} />
              </div>
              {showJudgeCount && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Judges: </span>
                  <span className="tabular-nums">{row.judgeCount}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
