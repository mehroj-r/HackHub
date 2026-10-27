import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import type { ScoringStatus } from "@/lib/domain/scoring";
import { cn } from "@/lib/utils";

import { ScoringStatusBadge } from "./scoring-status-badge";

export type QueueTeam = {
  id: string;
  name: string;
  title: string;
  status: ScoringStatus;
};

/** "4 of 7 scored": the judge's progress through one event's queue. */
export function QueueProgress({
  teams,
  className,
}: {
  teams: Pick<QueueTeam, "status">[];
  className?: string;
}) {
  const scored = teams.filter((t) => t.status === "SCORED").length;
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      <span className="font-mono font-semibold text-foreground tabular-nums">{scored}</span> of{" "}
      <span className="font-mono font-semibold text-foreground tabular-nums">{teams.length}</span>{" "}
      scored
    </p>
  );
}

/**
 * The judging queue: every submitted team of one event, in order, with this
 * judge's status. The team being scored is marked with aria-current and a
 * filled row, not by colour alone ("Scoring now").
 */
export function JudgeQueue({
  teams,
  currentId,
  label,
  className,
}: {
  teams: QueueTeam[];
  currentId?: string;
  /** Names the list for screen readers, e.g. "Teams in Demo Hack". */
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border">
        {teams.map((team, index) => {
          const current = team.id === currentId;
          return (
            <li key={team.id}>
              <Link
                href={`/judge/teams/${team.id}`}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group flex min-h-14 items-center gap-3 px-3 py-2.5 outline-none motion-safe:transition-colors",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  current && "bg-secondary",
                )}
              >
                <span
                  aria-hidden
                  className="w-5 shrink-0 self-start pt-0.5 text-right font-mono text-xs text-muted-foreground tabular-nums"
                >
                  {index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span
                    className={cn(
                      "text-sm break-words",
                      current ? "font-semibold" : "font-medium",
                    )}
                  >
                    {team.name}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <ScoringStatusBadge status={team.status} />
                    <span className="min-w-0 truncate text-xs text-muted-foreground">
                      {current ? "Scoring now" : team.title}
                    </span>
                  </span>
                </span>
                <ChevronRightIcon
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
