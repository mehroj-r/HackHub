"use client";

import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Anything an action or page lets throw, e.g. the database is down (docs/07 >
// Error handling). The message is generic on purpose: the details stay in the
// server log, matched by `digest`.

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Something went wrong.</EmptyTitle>
          <EmptyDescription>Try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* retry() re-fetches the server components and re-renders; reset()
              only re-renders, which can't fix a server error (Next.js 16.3+). */}
          <Button className="h-11 px-4" onClick={() => retry()}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
