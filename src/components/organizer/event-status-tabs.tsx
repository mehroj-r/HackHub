"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { StatusFilter } from "@/lib/domain/event-status";
import { cn } from "@/lib/utils";

// The filter tabs on "Events I run": links with ?status=, so each tab is its
// own URL and works without JavaScript. The current tab gets aria-current, a
// semibold label and the amber underline, as in the event sub-nav. On a phone
// the strip scrolls sideways inside itself; the only script here brings the
// current tab into view.

export function EventStatusTabs({
  tabs,
  current,
}: {
  tabs: { value: StatusFilter; label: string; count: number }[];
  current: StatusFilter;
}) {
  const active = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [current]);

  return (
    <nav
      aria-label="Filter events"
      className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max border-b">
        {tabs.map(({ value, label, count }) => {
          const isCurrent = value === current;
          return (
            <li key={value} className="-mb-px">
              <Link
                ref={isCurrent ? active : undefined}
                href={
                  value === "all" ? "/organizer" : `/organizer?status=${value}`
                }
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-10",
                  isCurrent
                    ? "border-highlight font-semibold text-foreground"
                    : "border-transparent font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                <span className="font-mono text-xs tabular-nums">{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
