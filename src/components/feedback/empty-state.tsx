import type { ReactNode } from "react";

import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

// Every empty list (redesign plan > Empty states): a muted Podium H, one
// sentence saying what will appear here, and the one action that fills it.
//
//   <EmptyState title="No events yet" action={<Button asChild>…</Button>}>
//     Events you register for show up here.
//   </EmptyState>

export function EmptyState({
  title,
  action,
  children,
  className,
}: {
  title: string;
  /** The one action that fills this list. Optional: some lists fill by themselves. */
  action?: ReactNode;
  /** One sentence: what will appear here. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      {/* The mark, quieted: the brand as a watermark, not a decoration. */}
      <LogoMark size={40} decorative className="opacity-35 grayscale" />
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-section-title text-balance">{title}</h2>
        {children && (
          <p className="text-pretty text-muted-foreground">{children}</p>
        )}
      </div>
      {action && <div className="flex flex-wrap justify-center gap-2">{action}</div>}
    </section>
  );
}
