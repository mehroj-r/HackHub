import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";
import { ROLE_HOME } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

// The only place that turns a session into a user (docs/07 > lib/auth). The
// session supplies the user id; the role always comes from the database, so a
// role change applies on the next request, not the next login (Decision 8).
//
// redirect() throws: never call these inside a try whose catch swallows
// everything.

/** The signed-in user, or null. One indexed query per request. */
export const getCurrentUser = cache(async () => {
  const id = (await auth())?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
});

/** The signed-in user; signed-out visitors go to /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** The signed-in user if their current role is one of `roles`; anyone else goes to their role home. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect(`${ROLE_HOME[user.role]}?notice=no-access`);
  }
  return user;
}
