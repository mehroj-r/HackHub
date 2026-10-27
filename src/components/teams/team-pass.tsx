import Link from "next/link";
import { UserPlusIcon } from "lucide-react";

import { CopyCodeButton } from "@/components/teams/copy-code-button";
import { LeaveTeamButton } from "@/components/teams/leave-team-button";
import type { FormAction } from "@/components/teams/use-toast-action";
import { isTeamFull } from "@/lib/domain/teams";
import { cn } from "@/lib/utils";

// The team pass (redesign > Team page): the team as one composed block. The
// stub on the left names the team and lists its members and open seats; the
// right side carries the invite code set large in Geist Mono as the pass
// number, with one-tap copy. Composition and type only: no perforations, no
// ticket costume. Leaving is a quiet link at the foot, behind a confirm.

type Member = { userId: string; name: string | null; faculty: string | null };

function initials(name: string | null) {
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function TeamPass({
  team,
  viewerId,
  maxTeamSize,
  submitted,
  leaveAction,
}: {
  team: { name: string; inviteCode: string; members: Member[] };
  viewerId: string;
  maxTeamSize: number;
  submitted: boolean;
  leaveAction: FormAction;
}) {
  const count = team.members.length;
  const full = isTeamFull(count, maxTeamSize);
  // Open seats are shown only while someone can still take them.
  const openSeats = submitted ? 0 : Math.max(0, maxTeamSize - count);

  return (
    <section
      aria-labelledby="team-name"
      className="overflow-hidden rounded-2xl border bg-card text-card-foreground"
    >
      <div className="grid md:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-1">
            <h2
              id="team-name"
              className="text-[1.75rem] leading-tight font-bold tracking-tight text-balance break-words md:text-[2rem]"
            >
              {team.name}
            </h2>
            <p className="text-sm text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">
                {count} of {maxTeamSize}
              </span>{" "}
              members
            </p>
          </div>

          <ul className="flex flex-col gap-1" aria-label="Members">
            {team.members.map((m) => {
              const you = m.userId === viewerId;
              return (
                <li key={m.userId}>
                  <Link
                    href={`/profile/${m.userId}`}
                    className="-mx-2 flex min-h-12 items-center gap-3 rounded-lg px-2 py-1.5 outline-none hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold"
                    >
                      {initials(m.name)}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium break-words">
                        {m.name ?? "No name yet"}
                      </span>
                      {m.faculty && (
                        <span className="text-sm text-muted-foreground break-words">
                          {m.faculty}
                        </span>
                      )}
                    </span>
                    {you && (
                      <span className="shrink-0 rounded-full border border-foreground/30 px-2 py-0.5 text-xs font-medium">
                        You
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            {Array.from({ length: openSeats }, (_, i) => (
              <li
                key={`open-${i}`}
                className="flex min-h-12 items-center gap-3 py-1.5 text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-foreground/25"
                >
                  <UserPlusIcon className="size-4" />
                </span>
                <span className="text-sm">Open seat</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-4 border-t bg-muted/40 p-6 md:border-t-0 md:border-l md:p-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Invite code</p>
            <p
              className="font-mono text-5xl leading-none font-semibold tracking-[0.18em] text-foreground tabular-nums select-all"
            >
              <span className="sr-only">
                {team.inviteCode.split("").join(" ")}
              </span>
              <span aria-hidden>{team.inviteCode}</span>
            </p>
          </div>
          <CopyCodeButton code={team.inviteCode} />
          <p
            className={cn(
              "text-sm",
              full ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {submitted
              ? "Your team has submitted, so nobody else can join."
              : full
                ? "Your team is full."
                : "Share it with your teammates. They enter it on this page under “Join with a code”."}
          </p>
        </div>
      </div>

      <div className="border-t px-6 py-3 md:px-8">
        <LeaveTeamButton
          action={leaveAction}
          teamName={team.name}
          isLastMember={count === 1}
          submitted={submitted}
        />
      </div>
    </section>
  );
}
