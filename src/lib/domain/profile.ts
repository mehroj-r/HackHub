import type { Role } from "@/generated/prisma/enums";

// Who may see a profile's phone. /profile/[userId] is open to every
// signed-in user (Decision 12), but the phone is for organizers to reach a
// team (docs/08 > /profile/[userId]): only organizers and the owner see it.
export function canSeePhone(
  viewer: { id: string; role: Role },
  ownerId: string,
): boolean {
  return viewer.role === "ORGANIZER" || viewer.id === ownerId;
}
