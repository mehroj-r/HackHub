import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireEvent, requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

// The event overview. #9 lands here after create and edit; the switches and
// publish button arrive with #12 (docs/08 > Event overview). Reads inside its
// own Suspense, like every organizer page (see edit/page.tsx).

export default function EventOverviewPage({
  params,
}: PageProps<"/organizer/events/[eventId]">) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <EventOverview params={params} />
    </Suspense>
  );
}

async function EventOverview({
  params,
}: Pick<PageProps<"/organizer/events/[eventId]">, "params">) {
  await requireRole("ORGANIZER");
  const { eventId } = await params;
  await requireEvent(eventId);
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: {
      description: true,
      maxTeamSize: true,
      _count: { select: { registrations: true, teams: true } },
    },
  });
  const submissions = await prisma.submission.count({
    where: { team: { eventId } },
  });

  const counts = [
    { label: "Registered participants", value: event._count.registrations },
    { label: "Teams", value: event._count.teams },
    { label: "Submissions", value: submissions },
  ];

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {counts.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <section>
        <h2 className="text-2xl font-semibold">About this event</h2>
        <p className="mt-2 whitespace-pre-line">{event.description}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Teams of up to {event.maxTeamSize}.
        </p>
      </section>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-16" />
    </div>
  );
}
