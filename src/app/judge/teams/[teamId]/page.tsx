import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon, LockIcon } from "lucide-react";

import { formatDateTime } from "@/components/judging/format";
import { JudgeQueue, QueueProgress } from "@/components/judging/judge-queue";
import { OnceToast } from "@/components/judging/once-toast";
import { Scorecard } from "@/components/judging/scorecard";
import { ScoringStatusBadge } from "@/components/judging/scoring-status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/dal";
import { SCORING_MESSAGES, scoringBlockedReason, scoringStatus } from "@/lib/domain/scoring";
import { prisma } from "@/lib/prisma";
import { judgeTeamsInEvent } from "@/lib/queries/judging";
import { scoreFieldName } from "@/lib/validation/scoring";

import { saveScores } from "./actions";

export const metadata: Metadata = { title: "Score a team · HackHub" };

// docs/08 > /judge/teams/[teamId], as the redesign's queue + scorecard: the
// event's queue on the left (desktop), the project and the scorecard on the
// right. On phones the queue lives on /judge; here a back link and "2 of 7"
// keep the place. Every judge may score every submitted team (Decision 1).
// Rendered under judge/loading.tsx, so reading the session, params and the
// database here is fine (Cache Components).
export default async function ScoreTeamPage({ params }: PageProps<"/judge/teams/[teamId]">) {
  const judge = await requireRole("JUDGE");
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      submission: { select: { title: true, description: true, repoUrl: true } },
      members: {
        orderBy: { joinedAt: "asc" },
        select: { user: { select: { id: true, profile: { select: { name: true } } } } },
      },
      event: {
        select: {
          id: true,
          name: true,
          submissionsOpen: true,
          resultsPublished: true,
          criteria: {
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            select: { id: true, name: true, weightPercent: true, maxScore: true },
          },
        },
      },
      scores: {
        where: { judgeId: judge.id },
        select: { criterionId: true, value: true, updatedAt: true },
      },
    },
  });
  // Teams without a submission aren't scored: same as an unknown team.
  if (!team?.submission) notFound();

  const { event, submission } = team;
  const queue = await judgeTeamsInEvent(judge.id, event.id);
  const position = queue.findIndex((t) => t.id === team.id) + 1;

  const myScores = new Map(team.scores.map((s) => [s.criterionId, s]));
  const criteria = event.criteria.map((c) => ({
    ...c,
    field: scoreFieldName(c.id),
    value: myScores.get(c.id)?.value ?? null,
  }));
  const scoredCount = criteria.filter((c) => c.value !== null).length;
  const lastSavedAt = team.scores.reduce<Date | null>(
    (latest, s) => (!latest || s.updatedAt > latest ? s.updatedAt : latest),
    null,
  );
  const blocked = scoringBlockedReason({ ...event, criteriaCount: criteria.length });

  return (
    <>
      <OnceToast param="saved" message="Scores saved." />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-3">
            <Link
              href="/judge"
              className="-ml-2 inline-flex min-h-9 items-center gap-1.5 self-start rounded-lg px-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowLeftIcon className="size-4" aria-hidden />
              Judging
            </Link>
            <div>
              <p className="font-semibold break-words">{event.name}</p>
              <QueueProgress teams={queue} />
            </div>
            <JudgeQueue teams={queue} currentId={team.id} label={`Teams to score in ${event.name}`} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* Phones and tablets: the queue is on /judge; keep the place here. */}
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Link
              href="/judge"
              className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowLeftIcon className="size-4" aria-hidden />
              Queue
            </Link>
            <p className="text-sm text-muted-foreground">
              Team <span className="font-mono text-foreground tabular-nums">{position}</span> of{" "}
              <span className="font-mono text-foreground tabular-nums">{queue.length}</span>
            </p>
          </div>

          <header>
            <p className="text-sm text-muted-foreground">{event.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-3xl font-bold break-words">{team.name}</h1>
              <ScoringStatusBadge status={scoringStatus(scoredCount, criteria.length)} />
            </div>
          </header>

          <article aria-labelledby="project-heading" className="mt-6">
            <h2 id="project-heading" className="text-xl font-semibold break-words">
              {submission.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="h-11 md:h-9">
                <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
                  Open the repository
                  <ExternalLinkIcon aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
              {blocked === null && (
                <a
                  href="#scorecard"
                  className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 md:min-h-9"
                >
                  Skip to the scorecard
                </a>
              )}
            </div>
            <p className="mt-4 max-w-prose leading-relaxed break-words whitespace-pre-line">
              {submission.description}
            </p>
            <h3 className="mt-6 text-sm font-semibold text-muted-foreground">Members</h3>
            <ul className="mt-1 flex flex-wrap gap-x-4 text-sm">
              {team.members.map(({ user }) => (
                <li key={user.id}>
                  <Link
                    href={`/profile/${user.id}`}
                    className="inline-flex min-h-11 items-center underline underline-offset-4 md:min-h-9"
                  >
                    {user.profile?.name.trim() || "No name yet"}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <section
            id="scorecard"
            aria-labelledby="scorecard-heading"
            className="mt-8 scroll-mt-24 border-t pt-6"
          >
            <h2 id="scorecard-heading" className="text-xl font-semibold">
              Your scores
            </h2>
            <div className="mt-4">
              {blocked === null ? (
                <Scorecard
                  action={saveScores.bind(null, team.id)}
                  criteria={criteria}
                  lastSaved={lastSavedAt ? formatDateTime(lastSavedAt) : null}
                />
              ) : (
                <ReadOnlyScores
                  reason={blocked}
                  eventId={event.id}
                  criteria={event.resultsPublished ? criteria : []}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/** The submissions-open, no-criteria and results-published states. */
function ReadOnlyScores({
  reason,
  eventId,
  criteria,
}: {
  reason: string;
  eventId: string;
  criteria: { id: string; name: string; maxScore: number; value: number | null }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <LockIcon aria-hidden />
        <AlertDescription>
          {reason}
          {reason === SCORING_MESSAGES.published && (
            <>
              {" "}
              <Link href={`/events/${eventId}`} className="font-medium underline">
                See the ranking
              </Link>
            </>
          )}
        </AlertDescription>
      </Alert>
      {criteria.length > 0 && (
        <dl className="flex flex-col divide-y rounded-xl border">
          {criteria.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
              <dt>{c.name}</dt>
              <dd className="font-mono tabular-nums">
                {c.value === null ? "Not scored" : `${c.value} / ${c.maxScore}`}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
