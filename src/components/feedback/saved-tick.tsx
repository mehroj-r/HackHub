import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// A short "Saved" tick next to a form's save button (redesign plan > Motion >
// Saves). Pass a value that changes on every successful save (a counter or a
// timestamp): each new value replays the tick, which pops in and fades out.
// With reduced motion it simply stays. It's announced politely and never
// replaces the toast.

export function SavedTick({
  savedAt,
  label = "Saved",
  className,
}: {
  /** Changes on every successful save; null or 0 before the first one. */
  savedAt: number | null;
  label?: string;
  className?: string;
}) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex", className)}>
      {savedAt ? (
        <span
          key={savedAt}
          className="inline-flex items-center gap-1 text-small text-muted-foreground motion-safe:animate-saved-flash"
        >
          <CheckIcon aria-hidden className="size-4 text-success" />
          {label}
        </span>
      ) : null}
    </span>
  );
}
