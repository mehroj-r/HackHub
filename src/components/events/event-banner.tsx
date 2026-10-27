import { cn } from "@/lib/utils";

import { eventArt, type EventPattern } from "./event-art";

// An event's wide header image: 8:3 from md up (the stored 1600×600 WebP), a
// little taller on phone so it doesn't turn into a thin strip. Without a
// banner it draws the event's generated gradient with a soft pattern on top
// (event-art.ts), so events without images still look finished.

export function EventBanner({
  bannerUrl,
  name,
  className,
  priority = false,
}: {
  /** From eventImageUrl(event.bannerPath); null shows the generated fallback. */
  bannerUrl: string | null;
  name: string;
  /** Sizing overrides, e.g. a shorter strip: "aspect-auto h-24". */
  className?: string;
  /** Above the fold (the event page hero): load it straight away. */
  priority?: boolean;
}) {
  const box = cn(
    "relative w-full overflow-hidden bg-muted aspect-[2/1] md:aspect-[8/3]",
    className,
  );

  if (bannerUrl) {
    return (
      <div className={box}>
        {/* Already a 1600×600 WebP from the upload pipeline. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bannerUrl}
          alt={`${name} banner`}
          width={1600}
          height={600}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    );
  }

  const { gradient, pattern } = eventArt(name);
  return (
    <div aria-hidden className={cn(box, gradient)}>
      <Pattern kind={pattern} />
      {/* A soft glow and a fade into the card, so text below reads well. */}
      <div className="absolute -top-1/2 -right-1/4 size-full rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background/40 to-transparent" />
    </div>
  );
}

function Pattern({ kind }: { kind: EventPattern }) {
  const id = `event-pattern-${kind}`;
  return (
    <svg
      className="absolute inset-0 size-full text-primary-foreground opacity-20"
      aria-hidden
      focusable="false"
    >
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          {kind === "dots" && (
            <circle cx="3" cy="3" r="1.6" fill="currentColor" />
          )}
          {kind === "grid" && (
            <path
              d="M24 0H0V24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          )}
          {kind === "diagonal" && (
            <path
              d="M-6 30L30 -6M-6 6L6 -6M18 30L30 18"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          )}
          {kind === "waves" && (
            <path
              d="M0 12c4-6 8-6 12 0s8 6 12 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
