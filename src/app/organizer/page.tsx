import Link from "next/link";
import { Suspense } from "react";
import { CalendarPlusIcon, PlusIcon } from "lucide-react";

import { EventCardMedia } from "@/components/events/event-card-media";
import { formatDateRange } from "@/components/organizer/event-dates";
import { EventStatusBadges } from "@/components/organizer/event-status-badges";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { eventImageUrl } from "@/lib/uploads/url";

// docs/08 > /organizer "Events I run": every event, not only the ones this
// organizer created, with its state at a glance. The title and primary action
// are static; the list is read inside Suspense (Cache Components).

export default function OrganizerHomePage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Events I run</h1>
        <NewEventButton />
      </div>
      <Suspense fallback={<EventListSkeleton />}>
        <EventList />
      </Suspense>
    </>
  );
}

async function EventList() {
  await requireRole("ORGANIZER");

  const [events, submitted] = await Promise.all([
    prisma.event.findMany({
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        registrationOpen: true,
        submissionsOpen: true,
        resultsPublished: true,
        logoPath: true,
        bannerPath: true,
        _count: { select: { registrations: true, teams: true } },
      },
    }),
    // Submissions per event: one row per team that has submitted.
    prisma.team.groupBy({
      by: ["eventId"],
      where: { submission: { isNot: null } },
      _count: { _all: true },
    }),
  ]);
  const submissionsByEvent = new Map(
    submitted.map((row) => [row.eventId, row._count._all]),
  );

  return events.length === 0 ? (
    <Empty className="mt-8 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarPlusIcon aria-hidden />
        </EmptyMedia>
        <EmptyDescription className="text-base text-foreground">
          No events yet. Create the first one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <NewEventButton />
      </EmptyContent>
    </Empty>
  ) : (
    <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const counts = [
          { label: "Registered", value: event._count.registrations },
          { label: "Teams", value: event._count.teams },
          {
            label: "Submissions",
            value: submissionsByEvent.get(event.id) ?? 0,
          },
        ];
        return (
          <li key={event.id}>
            <article className="relative h-full overflow-hidden rounded-2xl border bg-card transition-colors focus-within:ring-3 focus-within:ring-ring/50 hover:border-ring/60">
              <EventCardMedia
                name={event.name}
                logoUrl={eventImageUrl(event.logoPath)}
                bannerUrl={eventImageUrl(event.bannerPath)}
              />
              <div className="p-4 pt-3 sm:p-5 sm:pt-3">
                <h2 className="text-xl font-semibold break-words">
                  {/* The whole card is the link target; the name is its text. */}
                  <Link
                    href={`/organizer/events/${event.id}`}
                    className="outline-none after:absolute after:inset-0 after:rounded-2xl hover:underline"
                  >
                    {event.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateRange(event.startDate, event.endDate)}
                </p>
                <EventStatusBadges event={event} className="mt-3" />
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {counts.map(({ label, value }) => (
                    <div key={label} className="flex items-baseline gap-1.5">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-mono font-semibold tabular-nums">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function EventListSkeleton() {
  return (
    <div
      className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
    >
      <Skeleton className="h-80 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}

function NewEventButton() {
  return (
    <Button asChild className="h-11 px-4 md:h-9">
      <Link href="/organizer/events/new">
        <PlusIcon aria-hidden />
        New event
      </Link>
    </Button>
  );
}
