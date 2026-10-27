"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fromZodError, type ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth/dal";
import { validateEventDates } from "@/lib/domain/event-state";
import { prisma } from "@/lib/prisma";
import { readEventImages, storeEventImages } from "@/lib/uploads/event-images";
import {
  END_BEFORE_START,
  eventSchema,
  readEventForm,
  withDateOrderError,
} from "@/lib/validation/event";

/**
 * Creates an event with registration closed, so it stays off /events until the
 * organizer opens it (TC-27), with its logo and header image if given. Then
 * the overview, with the "Event created" toast.
 */
export async function createEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ORGANIZER");

  const values = readEventForm(formData);
  const parsed = eventSchema.safeParse(values);
  const images = await readEventImages(formData);
  if (!parsed.success) {
    const result = fromZodError(parsed.error);
    const fieldErrors = result?.ok === false ? result.fieldErrors : undefined;
    return {
      ok: false,
      fieldErrors: {
        ...withDateOrderError(fieldErrors, values),
        ...images.fieldErrors,
      },
      values,
    };
  }
  const data = parsed.data;

  const dateErrors: Record<string, string[]> = validateEventDates(
    data.startDate,
    data.endDate,
  )
    ? {}
    : { endDate: [END_BEFORE_START] };
  if (
    Object.keys(dateErrors).length ||
    Object.keys(images.fieldErrors).length
  ) {
    return {
      ok: false,
      fieldErrors: { ...dateErrors, ...images.fieldErrors },
      values,
    };
  }

  const event = await prisma.event.create({
    data: { ...data, registrationOpen: false, createdById: user.id },
    select: { id: true },
  });
  // The files live under the event's id, so they're written once it exists.
  if (images.images.length) {
    const paths = await storeEventImages(event.id, images.images);
    await prisma.event.update({ where: { id: event.id }, data: paths });
  }

  revalidatePath("/organizer");
  redirect(`/organizer/events/${event.id}?saved=created`);
}
