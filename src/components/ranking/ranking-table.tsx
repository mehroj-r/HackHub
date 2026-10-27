import Link from "next/link";
import { TrophyIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { RankingTotal } from "@/components/ranking/ranking-total";
import type { RankedTeam } from "@/lib/domain/ranking";
import type { RankingMember, RankingTeam } from "@/lib/queries/ranking";
import { cn } from "@/lib/utils";

// The scoreboard: one table shared by the public event page and the
// organizer's preview (docs/08 > Ranking section, Ranking preview; redesign >
// Ranking). No podium, no bars: rank, team, members and a big tabular total,
// plus the judge count in the preview. The leader is lit on DESIGN.md's fixed
// ramp. Below md each team becomes one big row with rank and total on the
// same line. Rows stagger in once and totals count up once, both only under
// motion-safe; with reduced motion the final table is there from the start.

type Props = {
  rows: RankedTeam<RankingTeam>[];
  /** Link member names to their profiles (signed-in viewers only). */
  linkMembers: boolean;
  /** The viewer's own team, marked with a label and not by colour alone. */
  viewerTeamId?: string;
  /** Organizer preview: also show how many judges scored each team. */
  showJudgeCount?: boolean;
};

/**
 * The shared stagger (globals.css > stagger-item, motion-safe only), capped
 * at the 8th row so a long table still settles quickly.
 */
function stagger(index: number) {
  return { "--i": Math.min(index, 8) } as CSSProperties;
}

const ROW_ENTER = "stagger-item";

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
                className="rounded-sm outline-none hover:text-foreground hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50"
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

/**
 * The rank on the fixed ramp (DESIGN.md > Ranking): the leader (rank 1,
 * including shared firsts) in full amber with the red trophy, which is also
 * the non-colour marker; every other rank in amber at 70%, still 5:1.
 */
function Rank({ rank }: { rank: number }) {
  const leader = rank === 1;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xl font-semibold tabular-nums",
        leader ? "text-primary" : "text-primary/70",
      )}
    >
      <span className="sr-only">Rank </span>
      {rank}
      {leader && (
        <TrophyIcon role="img" className="size-4 text-live" aria-label="Leader" />
      )}
    </span>
  );
}

function YourTeam() {
  return (
    <span className="rounded-full border border-foreground/30 px-2 py-0.5 text-xs font-medium">
      Your team
    </span>
  );
}

/** The leader: a 10% amber tint with an amber hairline (DESIGN.md). */
const LEADER = "border-primary/45 bg-primary/10";
/** The same on a table row, drawn on its cells (rows can't carry borders). */
const LEADER_ROW =
  "[&>td]:bg-primary/10 [&>td]:border-primary/45 [&>td]:border-t [&>td:first-child]:rounded-l-lg [&>td:first-child]:border-l [&>td:last-child]:rounded-r-lg [&>td:last-child]:border-r";
const MINE_ROW = "[&>td]:bg-muted/60";

export function RankingTable({
  rows,
  linkMembers,
  viewerTeamId,
  showJudgeCount = false,
}: Props) {
  return (
    <>
      <table className="hidden w-full border-separate border-spacing-0 md:table">
        <thead>
          <tr className="text-left text-sm text-muted-foreground">
            <th scope="col" className="w-20 border-b px-4 pb-3 font-medium">
              Rank
            </th>
            <th scope="col" className="border-b px-4 pb-3 font-medium">
              Team
            </th>
            <th scope="col" className="border-b px-4 pb-3 font-medium">
              Members
            </th>
            {showJudgeCount && (
              <th
                scope="col"
                className="w-24 border-b px-4 pb-3 text-right font-medium"
              >
                Judges
              </th>
            )}
            <th
              scope="col"
              className="w-40 border-b px-4 pb-3 text-right font-medium"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const mine = row.team.id === viewerTeamId;
            const leader = row.rank === 1;
            return (
              <tr
                key={row.team.id}
                aria-current={mine ? "true" : undefined}
                className={cn(
                  ROW_ENTER,
                  leader && LEADER_ROW,
                  mine && !leader && MINE_ROW,
                )}
                style={stagger(i)}
              >
                <td className="border-b px-4 py-4 align-middle">
                  <Rank rank={row.rank} />
                </td>
                <td className="border-b px-4 py-4 align-middle">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-balance break-words">
                      {row.team.name}
                    </span>
                    {mine && <YourTeam />}
                  </span>
                </td>
                <td className="border-b px-4 py-4 align-middle text-sm text-muted-foreground">
                  <Members
                    members={row.team.members}
                    linkMembers={linkMembers}
                  />
                </td>
                {showJudgeCount && (
                  <td className="border-b px-4 py-4 text-right align-middle font-mono tabular-nums">
                    {row.judgeCount}
                  </td>
                )}
                <td className="border-b px-4 py-4 text-right align-middle">
                  <RankingTotal value={row.total} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ol className="flex flex-col gap-2 md:hidden">
        {rows.map((row, i) => {
          const mine = row.team.id === viewerTeamId;
          const leader = row.rank === 1;
          return (
            <li
              key={row.team.id}
              aria-current={mine ? "true" : undefined}
              className={cn(
                "grid grid-cols-[3rem_1fr_auto] items-start gap-x-3 gap-y-1 rounded-lg border p-4",
                ROW_ENTER,
                leader && LEADER,
                mine && !leader && "bg-muted/60",
              )}
              style={stagger(i)}
            >
              <Rank rank={row.rank} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold break-words">
                    {row.team.name}
                  </span>
                  {mine && <YourTeam />}
                </span>
                <div className="text-sm text-muted-foreground">
                  <span className="sr-only">Members: </span>
                  <Members
                    members={row.team.members}
                    linkMembers={linkMembers}
                  />
                </div>
                {showJudgeCount && (
                  <p className="text-sm text-muted-foreground">
                    Judges:{" "}
                    <span className="font-mono text-foreground tabular-nums">
                      {row.judgeCount}
                    </span>
                  </p>
                )}
              </div>
              <RankingTotal value={row.total} />
            </li>
          );
        })}
      </ol>
    </>
  );
}
