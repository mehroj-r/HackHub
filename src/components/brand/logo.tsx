import { cn } from "@/lib/utils";

// The Podium H (DESIGN.md > Logo). Drawn on a 64-unit grid: two uprights make
// the H, and its crossbar is a podium, 2–1–3, for fair judging and the
// ranking. Keep the geometry in step with src/app/icon.svg.

export type LogoVariant = "default" | "onPrimary";

const ON_PRIMARY = "#1A0E00"; // --primary-foreground, for the mark on an amber tile

function Shapes({ variant }: { variant: LogoVariant }) {
  // default: uprights in the text colour, podium in amber.
  const upright = variant === "onPrimary" ? ON_PRIMARY : "var(--foreground)";
  const podium = variant === "onPrimary" ? ON_PRIMARY : "var(--primary)";
  return (
    <>
      <rect fill={upright} x="8" y="8" width="10" height="48" rx="3" />
      <rect fill={upright} x="46" y="8" width="10" height="48" rx="3" />
      <rect fill={podium} x="18" y="30" width="9.3" height="14" />
      <rect fill={podium} x="27.3" y="22" width="9.4" height="22" />
      <rect fill={podium} x="36.7" y="34" width="9.3" height="10" />
    </>
  );
}

/** The mark on its own. Named "HackHub" for screen readers. */
export function LogoMark({
  size = 32,
  variant = "default",
  className,
  decorative = false,
}: {
  size?: number;
  variant?: LogoVariant;
  className?: string;
  /** Next to the written name (as in Logo): hide it from screen readers. */
  decorative?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...(decorative
        ? { "aria-hidden": true, focusable: false }
        : { role: "img", "aria-label": "HackHub" })}
    >
      <Shapes variant={variant} />
    </svg>
  );
}

/**
 * The mark plus the "HackHub" wordmark in Unbounded 800 (the only place that
 * font is used). One image to assistive technology, read as "HackHub".
 */
export function Logo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="HackHub"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark size={size} decorative />
      <span
        aria-hidden
        className="font-wordmark text-lg leading-none font-extrabold tracking-[-0.02em]"
      >
        HackHub
      </span>
    </span>
  );
}
