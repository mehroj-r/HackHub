import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

// The event overview. #9 lands here after create and edit; the switches and
// publish button arrive with #12 (docs/08 > Event overview).

export default async function EventOverviewPage({
  params,
}: PageProps<"/organizer/events/[eventId]">) {
  await requireRole("ORGANIZER");
  const { eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      description: true,
      maxTeamSize: true,
      _count: { select: { registrations: true, teams: true } },
    },
  });
  if (!event) notFound();
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
