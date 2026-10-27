import { Suspense } from "react";

import { EventContext } from "@/components/events/event-context";
import { SubmissionForm } from "@/components/submission/submission-form";
import { SubmissionView } from "@/components/submission/submission-view";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireEvent, requireRole, requireTeamMember } from "@/lib/auth/dal";
import { eventPhase } from "@/lib/domain/event-phase";
import { submissionPhase } from "@/lib/domain/submission";
import { isProfileComplete } from "@/lib/domain/registration";
import { prisma } from "@/lib/prisma";

import { submitProject } from "./actions";

// Submit or edit the team's project (docs/08 > Submit project, #7). A member
// of a team in this event only; anyone without a team goes to the team page.
// Session, params and the database are read inside Suspense (Cache Components).

export default function SubmitPage({
  params,
}: PageProps<"/events/[eventId]/team/submit">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-10">
      <Suspense fallback={<SubmitSkeleton />}>
        <Submit params={params} />
      </Suspense>
    </main>
  );
}

async function Submit({
  params,
}: Pick<PageProps<"/events/[eventId]/team/submit">, "params">) {
  const user = await requireRole("PARTICIPANT");
  const { eventId } = await params;
  const event = await requireEvent(eventId);
  const team = await requireTeamMember(eventId);

  const [submission, anySubmission, profile] = await Promise.all([
    prisma.submission.findUnique({
      where: { teamId: team.id },
      select: {
        title: true,
        description: true,
        repoUrl: true,
        updatedAt: true,
      },
    }),
    prisma.submission.findFirst({
      where: { team: { eventId } },
      select: { id: true },
    }),
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: { name: true, faculty: true },
    }),
  ]);

  const phase = submissionPhase({
    submissionsOpen: event.submissionsOpen,
    resultsPublished: event.resultsPublished,
    eventHasSubmissions: anySubmission !== null,
    endDate: event.endDate,
    now: new Date(),
  });
  const teamHref = `/events/${eventId}/team`;

  return (
    <div className="flex flex-col gap-6">
      <EventContext
        event={event}
        phase={eventPhase({ ...event, hasSubmissions: anySubmission !== null })}
        crumbs={[{ label: "Team", href: teamHref }, { label: "Submit" }]}
        participant={{
          profileComplete: isProfileComplete(profile),
          registered: true,
          onTeam: true,
          submitted: submission !== null,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-page-title text-balance">
              {phase === "open" && submission
                ? "Edit submission"
                : phase === "open"
                  ? "Submit project"
                  : "Submission"}
            </h1>
          </CardTitle>
          <CardDescription>
            {team.name} · {event.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {phase === "not-open" && (
            <Alert>
              <AlertDescription>
                Submissions haven&apos;t opened yet. The organizer will open
                them when building starts.
              </AlertDescription>
            </Alert>
          )}

          {phase === "closed" && (
            <Alert>
              <AlertDescription>
                {submission
                  ? "Submissions are closed for this event."
                  : "Submissions are closed for this event. Your team didn't submit a project, so it won't be ranked."}
              </AlertDescription>
            </Alert>
          )}

          {phase === "open" && (
            <SubmissionForm
              action={submitProject.bind(null, eventId)}
              initial={
                submission
                  ? {
                      title: submission.title,
                      description: submission.description,
                      repoUrl: submission.repoUrl,
                    }
                  : null
              }
              teamHref={teamHref}
            />
          )}

          {phase === "closed" && submission && (
            <SubmissionView submission={submission} />
          )}

          {submission && (
            <p className="text-muted-foreground text-sm">
              Last updated {formatDateTime(submission.updatedAt)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// docs/08 > Dates and times: GMT+5, `26 Oct 2026, 14:05`, no zone label.
const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tashkent",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatDateTime(date: Date) {
  return dateTime.format(date);
}

function SubmitSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}
