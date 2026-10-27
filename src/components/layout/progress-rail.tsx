import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// The participant's progress inside an event (redesign plan > Participant
// progress): Profile · Registered · Team · Submitted. Done steps are amber
// with a check, the current step is outlined amber, and each step links to
// where you complete it. Once every step is done it folds to "All set".

export type ProgressStep = {
  label: string;
  done: boolean;
  current?: boolean;
  href?: string;
};

export function ProgressRail({
  steps,
  hideWhenDone = false,
  className,
}: {
  steps: ProgressStep[];
  /** Render nothing (instead of "All set") once every step is done. */
  hideWhenDone?: boolean;
  className?: string;
}) {
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = steps.length > 0 && doneCount === steps.length;

  if (allDone) {
    if (hideWhenDone) return null;
    return (
      <p
        className={cn(
          "flex items-center gap-2 text-small text-muted-foreground",
          className,
        )}
      >
        <CheckIcon aria-hidden className="size-4 text-primary" />
        All set: {steps.map((s) => s.label.toLowerCase()).join(", ")}.
      </p>
    );
  }

  return (
    <nav aria-label="Your progress" className={cn("min-w-0", className)}>
      <p className="sr-only">
        {doneCount} of {steps.length} steps done.
      </p>
      <ol className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {steps.map((step, i) => {
          const body = (
            <>
              <span
                aria-hidden
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] font-semibold tabular-nums",
                  step.done && "border-primary bg-primary text-primary-foreground",
                  !step.done && step.current && "border-primary text-primary",
                  !step.done && !step.current && "text-muted-foreground",
                )}
              >
                {step.done ? <CheckIcon className="size-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap",
                  step.current ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
                <span className="sr-only">
                  {step.done ? " (done)" : step.current ? " (next)" : ""}
                </span>
              </span>
            </>
          );
          return (
            <li key={step.label} className="flex shrink-0 items-center gap-1">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-4 sm:w-8",
                    steps[i - 1].done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              {step.href ? (
                <Link
                  href={step.href}
                  aria-current={step.current ? "step" : undefined}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-1.5 text-small outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-8"
                >
                  {body}
                </Link>
              ) : (
                <span
                  aria-current={step.current ? "step" : undefined}
                  className="inline-flex min-h-11 items-center gap-1.5 px-1.5 text-small md:min-h-8"
                >
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
