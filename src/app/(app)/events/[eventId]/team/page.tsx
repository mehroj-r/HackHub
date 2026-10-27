import Link from "next/link";
import { FileCheckIcon, InfoIcon } from "lucide-react";
import { Suspense } from "react";

import { EventContext } from "@/components/events/event-context";
import { StatusBadge } from "@/components/events/status-badge";
import { ActionDock } from "@/components/layout/action-dock";
import { PageHeader } from "@/components/layout/page-header";
import { TeamPass } from "@/components/teams/team-pass";
import { CreateTeamForm, JoinTeamForm } from "@/components/teams/team-forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireEvent, requireRole } from "@/lib/auth/dal";
import { eventPhase } from "@/lib/domain/event-phase";
import { canSubmit } from "@/lib/domain/event-state";
import { isProfileComplete } from "@/lib/domain/registration";
import { prisma } from "@/lib/prisma";
import { eventHasSubmissions } from "@/lib/queries/participant-progress";

import { createTeam, joinTeam, leaveTeam } from "./actions";

// docs/08 > /events/[eventId]/team, as the redesign's "team pass": your team
// as one composed block (name, members and open seats, and the invite code
// set large as the pass number), with the submission as the page's single
// primary action. Before you're on a team: create or join, side by side.
// Params and the session are read inside Suspense (Cache Components).

export default function TeamPage({
  params,
}: PageProps<"/events/[eventId]/team">) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
      <Suspense fallback={<TeamSkeleton />}>
        <Team params={params} />
      </Suspense>
    </main>
  );
}

async function Team({
  params,
}: Pick<PageProps<"/events/[eventId]/team">, "params">) {
  const user = await requireRole("PARTICIPANT");
  const { eventId } = await params;
  const event = await requireEvent(eventId);

  const [registration, profile, hasSubmissions] = await Promise.all([
    prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: user.id } },
      select: {
        membership: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                inviteCode: true,
                submission: { select: { id: true } },
                members: {
                  orderBy: { joinedAt: "asc" },
                  select: {
                    userId: true,
                    user: {
                      select: {
                        profile: { select: { name: true, faculty: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: { name: true, faculty: true },
    }),
    eventHasSubmissions(event.id),
  ]);

  const team = registration?.membership?.team ?? null;
  const context = (
    <EventContext
      event={event}
      phase={eventPhase({ ...event, hasSubmissions })}
      crumbs={[{ label: "Team" }]}
      participant={{
        profileComplete: isProfileComplete(profile),
        registered: registration !== null,
        onTeam: team !== null,
        submitted: team?.submission != null,
      }}
    />
  );

  if (!registration) {
    return (
      <div className="flex flex-col gap-6">
        {context}
        <PageHeader title="My team" />
        <Alert>
          <InfoIcon aria-hidden />
          <AlertTitle>You&apos;re not registered</AlertTitle>
          <AlertDescription>
            <p>
              Register for this event before joining a team.{" "}
              <Link
                href={`/events/${event.id}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Go to {event.name}
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col gap-8">
        {context}
        <PageHeader
          title="My team"
          description={`You're registered for ${event.name}. Agree on your team with your teammates first: one of you creates it and shares the invite code, the others join with it.`}
        />
        <div className="grid overflow-hidden rounded-2xl border bg-card text-card-foreground md:grid-cols-2">
          <section
            aria-labelledby="create-heading"
            className="flex flex-col gap-5 p-6 md:p-8"
          >
            <div className="flex flex-col gap-1">
              <h2 id="create-heading" className="text-xl font-semibold">
                Create a team
              </h2>
              <p className="text-sm text-muted-foreground">
                Start a new team for up to {event.maxTeamSize} people.
              </p>
            </div>
            <CreateTeamForm action={createTeam.bind(null, event.id)} />
          </section>
          <section
            aria-labelledby="join-heading"
            className="flex flex-col gap-5 border-t p-6 md:border-t-0 md:border-l md:p-8"
          >
            <div className="flex flex-col gap-1">
              <h2 id="join-heading" className="text-xl font-semibold">
                Join with a code
              </h2>
              <p className="text-sm text-muted-foreground">
                Got a code from a teammate? Enter it here.
              </p>
            </div>
            <JoinTeamForm action={joinTeam.bind(null, event.id)} />
          </section>
        </div>
      </div>
    );
  }

  const submitted = team.submission !== null;
  const submissionsOpen = canSubmit(event);
  const submitHref = `/events/${event.id}/team/submit`;

  const submitAction =
    submissionsOpen || submitted ? (
      <Button
        asChild
        size="lg"
        variant={submissionsOpen ? "default" : "outline"}
        className="h-11 w-full px-6 text-base md:w-auto"
      >
        <Link href={submitHref}>
          <FileCheckIcon aria-hidden />
          {!submitted
            ? "Submit project"
            : submissionsOpen
              ? "Edit submission"
              : "View submission"}
        </Link>
      </Button>
    ) : null;

  return (
    <div className="flex flex-col gap-8">
      {context}
      <PageHeader
        title="My team"
        description={`Your team in ${event.name}.`}
        action={
          submitAction && <div className="hidden md:block">{submitAction}</div>
        }
      >
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StatusBadge on={submitted}>
            {submitted ? "Submitted" : "Not submitted"}
          </StatusBadge>
          {!submitted && !submissionsOpen && (
            <span className="text-sm text-muted-foreground">
              Submissions aren&apos;t open right now.
            </span>
          )}
        </div>
      </PageHeader>

      <TeamPass
        team={{
          name: team.name,
          inviteCode: team.inviteCode,
          members: team.members.map((m) => ({
            userId: m.userId,
            name: m.user.profile?.name?.trim() || null,
            faculty: m.user.profile?.faculty ?? null,
          })),
        }}
        viewerId={user.id}
        maxTeamSize={event.maxTeamSize}
        submitted={submitted}
        leaveAction={leaveTeam.bind(null, event.id)}
      />

      {submitAction && (
        <ActionDock className="md:hidden">{submitAction}</ActionDock>
      )}
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
