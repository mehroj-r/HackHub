"use client";

import Link from "next/link";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { EventAvatar } from "@/components/events/event-avatar";
import { PhaseDot } from "@/components/events/phase-dot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PHASE_LABEL, type EventPhase } from "@/lib/domain/event-phase";
import { cn } from "@/lib/utils";

export type ChipEvent = {
  id: string;
  name: string;
  logoUrl: string | null;
  phase: EventPhase;
  href: string;
};

const CHIP =
  "inline-flex h-11 max-w-full min-w-0 items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm outline-none md:h-9";

function ChipFace({ event }: { event: ChipEvent }) {
  return (
    <>
      <EventAvatar
        name={event.name}
        logoUrl={event.logoUrl}
        size="sm"
        decorative
        className="size-7 rounded-full text-[0.625rem] ring-0 md:size-7"
      />
      <span className="min-w-0 truncate font-medium">{event.name}</span>
      <PhaseDot phase={event.phase} />
      <span className="sr-only">{PHASE_LABEL[event.phase]}</span>
    </>
  );
}

/** The chip's face and its switcher menu. Rendered by <EventChip>. */
export function EventChipMenu({
  current,
  events,
  allHref,
  signedIn,
}: {
  current: ChipEvent;
  events: ChipEvent[];
  allHref: string;
  signedIn: boolean;
}) {
  // Nothing to switch to: a plain label, not a menu that does nothing.
  if (!signedIn || events.length === 0) {
    return (
      <span className={CHIP} aria-label={`Current event: ${current.name}`}>
        <ChipFace event={current} />
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          CHIP,
          "transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
        aria-label={`Current event: ${current.name}. Switch event`}
      >
        <ChipFace event={current} />
        <ChevronsUpDownIcon
          aria-hidden
          className="size-3.5 shrink-0 text-muted-foreground"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel>Switch event</DropdownMenuLabel>
        {events.map((event) => {
          const isCurrent = event.id === current.id;
          return (
            <DropdownMenuItem key={event.id} asChild>
              <Link
                href={event.href}
                aria-current={isCurrent ? "page" : undefined}
                className="flex min-h-11 items-center gap-2.5"
              >
                <EventAvatar
                  name={event.name}
                  logoUrl={event.logoUrl}
                  size="sm"
                  decorative
                  className="size-8 rounded-md text-xs ring-0 md:size-8"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{event.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <PhaseDot phase={event.phase} className="size-1.5" />
                    {PHASE_LABEL[event.phase]}
                  </span>
                </span>
                {isCurrent && (
                  <CheckIcon aria-hidden className="size-4 text-primary" />
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={allHref} className="min-h-11">
            All events
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
