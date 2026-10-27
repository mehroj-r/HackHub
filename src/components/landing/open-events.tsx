import Link from "next/link";
import { connection } from "next/server";
import { ArrowRightIcon, CalendarDaysIcon, UsersIcon } from "lucide-react";

import { EventCardMedia } from "@/components/events/event-card-media";
import { formatEventDates } from "@/components/events/event-format";
import { EmptyState } from "@/components/feedback/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { eventImageUrl } from "@/lib/uploads/url";

// The real open events under the landing hero: the soonest three with
// registration open, and a link to all of them.

const SHOWN = 3;

export async function OpenEvents() {
  await connection();
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { registrationOpen: true },
      orderBy: [{ startDate: "asc" }, { name: "asc" }],
      take: SHOWN,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        maxTeamSize: true,
        logoPath: true,
        bannerPath: true,
      },
    }),
    prisma.event.count({ where: { registrationOpen: true } }),
  ]);

  if (events.length === 0) {
    return (
      <EmptyState title="No events are open right now" className="mt-6">
        Open events show up here as soon as an organizer opens registration.
      </EmptyState>
    );
  }

  return (
    <>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <li key={event.id} className="flex">
            <Link
              href={`/events/${event.id}`}
              className="group flex w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground outline-none transition-colors hover:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <EventCardMedia
                name={event.name}
                logoUrl={eventImageUrl(event.logoPath)}
                bannerUrl={eventImageUrl(event.bannerPath)}
              />
              <div className="flex flex-1 flex-col gap-2 p-5 pt-3">
                <h3 className="font-semibold break-words group-hover:underline group-hover:underline-offset-4">
                  {event.name}
                </h3>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-small text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDaysIcon className="size-4" aria-hidden />
                    {formatEventDates(event.startDate, event.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UsersIcon className="size-4" aria-hidden />
                    Teams of up to {event.maxTeamSize}
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {total > SHOWN && (
        <p className="mt-4">
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md font-medium underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            See all {total} open events
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </p>
      )}
    </>
  );
}

export function OpenEventsSkeleton() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3" aria-busy="true">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
