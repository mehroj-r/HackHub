import { EventForm } from "@/components/organizer/event-form";
import { requireEvent, requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { toDateInput } from "@/lib/validation/event";

import { updateEvent } from "./actions";

// docs/08 > Event form, prefilled. The event layout above shows the name,
// badges and sub-nav; its loading.tsx wraps this page in Suspense.

export default async function EditEventPage({
  params,
}: PageProps<"/organizer/events/[eventId]/edit">) {
  await requireRole("ORGANIZER");
  const { eventId } = await params;
  const event = await requireEvent(eventId);
  const { description } = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { description: true },
  });

  return (
    <>
      <h2 className="text-2xl font-semibold">Edit event</h2>
      <div className="mt-6">
        <EventForm
          action={updateEvent.bind(null, eventId)}
          initial={{
            name: event.name,
            description,
            startDate: toDateInput(event.startDate),
            endDate: toDateInput(event.endDate),
            maxTeamSize: String(event.maxTeamSize),
          }}
          submitLabel="Save changes"
          cancelHref={`/organizer/events/${eventId}`}
        />
      </div>
    </>
  );
}
