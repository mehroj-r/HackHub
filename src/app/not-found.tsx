import Link from "next/link";
import { connection } from "next/server";
import { SearchXIcon } from "lucide-react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth/dal";
import { ROLE_HOME } from "@/lib/auth/permissions";

// Unknown URLs and every notFound() call, e.g. requireEvent() with an unknown
// id (docs/08 > Access rules for every page).

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>We couldn&apos;t find this page.</EmptyTitle>
          <EmptyDescription>
            The link may be wrong, or the page may have been removed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* The session is read inside Suspense: Cache Components is on. */}
          <Suspense fallback={<HomeButton href="/" />}>
            <RoleHomeButton />
          </Suspense>
        </EmptyContent>
      </Empty>
    </main>
  );
}

/** The signed-in user's role home; a signed-out visitor goes to the landing page. */
async function RoleHomeButton() {
  await connection();
  const user = await getCurrentUser();
  return <HomeButton href={user ? ROLE_HOME[user.role] : "/"} />;
}

function HomeButton({ href }: { href: string }) {
  return (
    <Button asChild className="h-11 px-4">
      <Link href={href}>Go to your home page</Link>
    </Button>
  );
}
