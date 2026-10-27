import "server-only";

import { isProfileComplete } from "@/lib/domain/registration";
import { prisma } from "@/lib/prisma";

// A participant's standing in one event: what the progress rail and the event
// page's "your status" read (redesign > Participant progress). Two indexed
// lookups; the caller has already checked the role.

export type ParticipantState = {
  profileComplete: boolean;
  registered: boolean;
  onTeam: boolean;
  submitted: boolean;
  team: { id: string; name: string; memberCount: number } | null;
};

export async function getParticipantState(
  eventId: string,
  userId: string,
): Promise<ParticipantState> {
  const [profile, registration] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { name: true, faculty: true },
    }),
    prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: {
        membership: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                submission: { select: { id: true } },
                _count: { select: { members: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const team = registration?.membership?.team ?? null;
  return {
    profileComplete: isProfileComplete(profile),
    registered: registration !== null,
    onTeam: team !== null,
    submitted: team?.submission != null,
    team: team
      ? { id: team.id, name: team.name, memberCount: team._count.members }
      : null,
  };
}

/** Whether any team in the event has submitted: what tells "judging" from "upcoming". */
export async function eventHasSubmissions(eventId: string) {
  const row = await prisma.submission.findFirst({
    where: { team: { eventId } },
    select: { id: true },
  });
  return row !== null;
}
