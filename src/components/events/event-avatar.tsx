import { cn } from "@/lib/utils";

import { eventArt, eventInitials } from "./event-art";

// An event's logo: a rounded square, like a profile picture. The ring in the
// page background colour lets it sit on top of a banner's bottom edge. Without
// a logo it shows the event's initials on its generated gradient
// (event-art.ts), so every event has one.

const SIZES = {
  sm: "size-10 rounded-lg text-sm ring-2",
  md: "size-16 rounded-xl text-xl ring-4",
  lg: "size-20 rounded-2xl text-2xl ring-4 md:size-28 md:text-4xl",
} as const;

export type EventAvatarSize = keyof typeof SIZES;

export function EventAvatar({
  name,
  logoUrl,
  size = "md",
  className,
}: {
  name: string;
  /** From eventImageUrl(event.logoPath); null shows the generated fallback. */
  logoUrl: string | null;
  size?: EventAvatarSize;
  className?: string;
}) {
  const box = cn(
    "relative shrink-0 overflow-hidden ring-background shadow-sm",
    SIZES[size],
    className,
  );

  if (logoUrl) {
    return (
      // Served as-is by the /uploads route (already a 512×512 WebP), so a
      // plain <img> is enough: next/image would only re-encode it.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        width={512}
        height={512}
        loading="lazy"
        decoding="async"
        className={cn(box, "bg-muted object-cover")}
      />
    );
  }

  const { gradient } = eventArt(name);
  return (
    // Decorative: the event name is always written next to it.
    <span
      aria-hidden
      className={cn(
        box,
        gradient,
        "flex items-center justify-center font-bold tracking-tight text-primary-foreground select-none",
      )}
    >
      {eventInitials(name)}
    </span>
  );
}
