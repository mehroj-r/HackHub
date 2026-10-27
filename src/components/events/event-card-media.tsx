import { cn } from "@/lib/utils";

import { EventAvatar } from "./event-avatar";
import { EventBanner } from "./event-banner";

// The top of every event card (/events, /my-events, /organizer): the banner
// edge to edge, with the logo overlapping its bottom-left corner. Put it first
// inside a card with `overflow-hidden`; the content below starts under the
// avatar.

export function EventCardMedia({
  name,
  logoUrl,
  bannerUrl,
  className,
}: {
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <EventBanner
        name={name}
        bannerUrl={bannerUrl}
        className="aspect-[5/2] md:aspect-[8/3]"
      />
      <div className="relative z-10 -mt-8 px-5">
        <EventAvatar name={name} logoUrl={logoUrl} size="md" className="ring-card" />
      </div>
    </div>
  );
}
