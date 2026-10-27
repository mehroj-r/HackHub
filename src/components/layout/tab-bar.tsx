import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

import { TabBarNav } from "./tab-bar-nav";

// The phone bottom tab bar, chosen by role (redesign plan > App shell). The
// root layout renders it inside <Suspense>. Visitors get none. It's fixed to
// the bottom below md and reserves its own height, so page content and the
// ActionDock sit above it (globals.css: --tab-bar-h).
export async function TabBar() {
  await connection();
  const user = await getCurrentUser();
  if (!user) return null;

  // A participant's Team tab opens the team page of their current event: the
  // soonest one whose results aren't out yet.
  let teamHref: string | undefined;
  if (user.role === "PARTICIPANT") {
    const current = await prisma.eventRegistration.findFirst({
      where: { userId: user.id, event: { resultsPublished: false } },
      orderBy: { event: { startDate: "asc" } },
      select: { eventId: true },
    });
    if (current) teamHref = `/events/${current.eventId}/team`;
  }

  return <TabBarNav role={user.role} teamHref={teamHref} />;
}
