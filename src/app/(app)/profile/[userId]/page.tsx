import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  ProfileCard,
  ProfileCardSkeleton,
} from "@/components/profile/profile-card";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

// Any signed-in user can view any profile, read-only (Decision 12). The
// session and params are read inside Suspense because Cache Components is on.

export default function ProfilePage({
  params,
}: PageProps<"/profile/[userId]">) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Suspense fallback={<ProfileCardSkeleton />}>
        <UserProfile params={params} />
      </Suspense>
    </main>
  );
}

async function UserProfile({
  params,
}: Pick<PageProps<"/profile/[userId]">, "params">) {
  const viewer = await requireUser();
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      profile: {
        select: {
          name: true,
          faculty: true,
          skills: true,
          bio: true,
          links: true,
        },
      },
    },
  });
  if (!user) notFound();

  return <ProfileCard user={user} isOwn={viewer.id === userId} />;
}
