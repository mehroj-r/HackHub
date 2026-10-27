import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// The page's one primary action, thumb-first (redesign plan > Phone). Below md
// it sticks to the bottom of the screen, above the tab bar and the safe area;
// from md up it's an ordinary inline block where the page puts it.
//
//   <ActionDock><Button className="w-full md:w-auto">Register</Button></ActionDock>
//
// Put it at the end of the page content (or of the section it belongs to):
// it's sticky, so it never covers what comes after it.

export function ActionDock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-action-dock
      className={cn(
        // Phone: a full-width strip over the page, flush above the tab bar.
        "sticky bottom-[calc(var(--tab-bar-h)+env(safe-area-inset-bottom))] z-30 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85",
        "flex flex-col gap-2 *:min-h-11",
        // Desktop: inline, no chrome.
        "md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none md:*:min-h-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
