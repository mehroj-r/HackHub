"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { getActiveHref, type NavItem } from "./nav-items";

export function NavLinks({
  items,
  orientation = "horizontal",
  onNavigate,
}: {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // The current item is marked with aria-current="page", bold text and an
  // underline, so colour is never the only signal.
  const current = getActiveHref(items, pathname);

  return (
    <nav aria-label="Main">
      <ul
        className={cn(
          "flex gap-1",
          orientation === "vertical" ? "flex-col" : "items-center",
        )}
      >
        {items.map((item) => {
          const isCurrent = item.href === current;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-lg px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                  orientation === "vertical" && "w-full text-base",
                  isCurrent
                    ? "font-semibold text-foreground underline decoration-2 underline-offset-8 decoration-highlight"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
