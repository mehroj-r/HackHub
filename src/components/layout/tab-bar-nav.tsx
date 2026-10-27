"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  GavelIcon,
  ListChecksIcon,
  TrophyIcon,
  UserRoundIcon,
  UsersIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

import { getTabItems, type TabIcon } from "./nav-items";

const ICONS: Record<TabIcon, LucideIcon> = {
  events: CalendarDaysIcon,
  "my-events": ListChecksIcon,
  team: UsersRoundIcon,
  profile: UserRoundIcon,
  users: UsersIcon,
  score: GavelIcon,
  results: TrophyIcon,
};

export function TabBarNav({
  role,
  teamHref,
}: {
  role: Role;
  teamHref?: string;
}) {
  const pathname = usePathname();
  const items = getTabItems(role, { teamHref });

  return (
    <>
      {/* Keeps the end of every page clear of the fixed bar. */}
      <div aria-hidden className="h-[calc(var(--tab-bar-h)+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Sections"
        data-tab-bar
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm supports-[backdrop-filter]:bg-background/85 md:hidden"
      >
        <ul className="mx-auto grid h-16 max-w-md grid-flow-col auto-cols-fr">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            const current = item.match(pathname);
            return (
              <li key={item.label} className="flex">
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                    current
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {/* The current tab: amber bar on top, like the desktop
                      nav's underline, plus bold text and aria-current. */}
                  {current && (
                    <span
                      aria-hidden
                      className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary"
                    />
                  )}
                  <Icon
                    aria-hidden
                    className={cn("size-5", current && "text-primary")}
                  />
                  <span className={cn(current && "font-semibold")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
