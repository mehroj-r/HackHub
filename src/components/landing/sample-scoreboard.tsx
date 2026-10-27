import type { CSSProperties } from "react";
import { TrophyIcon } from "lucide-react";

import { CountUp } from "@/components/feedback/count-up";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// The landing hero (redesign plan > Landing: demo-day big screen): the
// published ranking of a sample event, clearly marked "Example". Composition
// and type, not a costume: one sharp table, big tabular totals, the leader lit
// per DESIGN.md's fixed ramp. Rows rise in once and totals count up once,
// only under motion-safe.

type SampleRow = {
  rank: number;
  team: string;
  project: string;
  judges: number;
  total: number;
};

const EVENT = "HackHub Demo Day";
const ROWS: SampleRow[] = [
  {
    rank: 1,
    team: "Team Kompas",
    project: "Campus route planner",
    judges: 3,
    total: 91.4,
  },
  {
    rank: 2,
    team: "Bytes of Bukhara",
    project: "Canteen queue tracker",
    judges: 3,
    total: 84.0,
  },
  {
    rank: 3,
    team: "NoSleep.js",
    project: "Study group matcher",
    judges: 3,
    total: 77.5,
  },
  {
    rank: 4,
    team: "Silk Road Devs",
    project: "Lost and found board",
    judges: 3,
    total: 72.3,
  },
  {
    rank: 5,
    team: "Null Pointers",
    project: "Lab booking bot",
    judges: 3,
    total: 68.9,
  },
];

export function SampleScoreboard({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)]",
        className,
      )}
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-3 sm:px-6">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-semibold">{EVENT}</span>
          <span className="text-small text-muted-foreground">
            Final ranking
          </span>
        </span>
        <Badge variant="outline">Example</Badge>
      </figcaption>

      <table className="w-full text-left">
        <caption className="sr-only">
          Example ranking of a sample event, {EVENT}: rank, team, project,
          judges and total score out of 100.
        </caption>
        <thead className="text-small text-muted-foreground">
          <tr className="border-b">
            <th
              scope="col"
              className="w-14 py-2.5 pl-4 font-medium sm:w-16 sm:pl-6"
            >
              Rank
            </th>
            <th scope="col" className="py-2.5 font-medium">
              Team
            </th>
            <th scope="col" className="hidden py-2.5 font-medium md:table-cell">
              Judges
            </th>
            <th
              scope="col"
              className="py-2.5 pr-4 text-right font-medium sm:pr-6"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => {
            const leader = row.rank === 1;
            return (
              <tr
                key={row.team}
                className={cn(
                  "stagger-item border-b last:border-b-0",
                  leader &&
                    "bg-primary/10 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_45%,transparent)]",
                )}
                style={{ "--i": i + 1 } as CSSProperties}
              >
                <td className="py-3 pl-4 align-middle sm:py-4 sm:pl-6">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 font-mono text-lg font-semibold tabular-nums",
                      leader ? "text-primary" : "text-primary/70",
                    )}
                  >
                    {leader && (
                      <TrophyIcon
                        role="img"
                        aria-label="Leader"
                        className="size-4 text-live"
                      />
                    )}
                    {row.rank}
                  </span>
                </td>
                <td className="py-3 align-middle sm:py-4">
                  <span className="block font-medium">{row.team}</span>
                  <span className="block text-small text-muted-foreground">
                    {row.project}
                  </span>
                </td>
                <td className="hidden py-3 align-middle font-mono text-muted-foreground tabular-nums md:table-cell sm:py-4">
                  {row.judges}
                </td>
                <td className="py-3 pr-4 text-right align-middle sm:py-4 sm:pr-6">
                  <CountUp
                    value={row.total}
                    decimals={1}
                    className={cn(
                      "font-mono text-2xl font-semibold sm:text-3xl",
                      leader ? "text-foreground" : "text-foreground/85",
                    )}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}
