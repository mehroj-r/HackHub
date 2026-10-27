import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

// The trail at the top of a page (redesign plan > App shell), e.g.
// Events › HackHub Demo Day › Team. The last item is the current page and is
// not a link. On phones the middle collapses to "…" and the current item is
// left to the page's h1 (it stays for screen readers): first › … › parent.

export type BreadcrumbItem = { label: string; href?: string };

function Separator() {
  return (
    <ChevronRightIcon aria-hidden className="size-3.5 shrink-0 opacity-60" />
  );
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  if (items.length === 0) return null;
  const last = items.length - 1;
  // Items between the first and the parent of the current page.
  const collapses = last >= 3;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1 text-small text-muted-foreground">
        {items.map((item, i) => {
          const current = i === last;
          const middle = collapses && i > 0 && i < last - 1;
          return (
            <Fragment key={`${i}-${item.label}`}>
              {collapses && i === 1 && (
                <li aria-hidden className="flex items-center gap-1 sm:hidden">
                  <Separator />…
                </li>
              )}
              <li
                className={cn(
                  "flex min-w-0 items-center gap-1",
                  middle && "hidden sm:flex",
                  current && last > 0 && "sr-only sm:not-sr-only sm:flex",
                )}
              >
                {i > 0 && <Separator />}
                {current || !item.href ? (
                  <span
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "truncate",
                      current && "font-medium text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 min-w-0 items-center rounded-md px-0.5 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-8"
                  >
                    <span className="truncate">{item.label}</span>
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
