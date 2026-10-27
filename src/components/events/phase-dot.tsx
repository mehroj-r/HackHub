import { isLivePhase, PHASE_LABEL, type EventPhase } from "@/lib/domain/event-phase";
import { cn } from "@/lib/utils";

/**
 * The phase as a dot: the live red while registration or submissions are
 * open (DESIGN.md: red means live), a quiet dot otherwise. Decorative: always
 * pair it with the phase in words (PhaseLabel, or an sr-only label).
 */
export function PhaseDot({
  phase,
  className,
}: {
  phase: EventPhase;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        isLivePhase(phase) ? "bg-live" : "bg-muted-foreground/60",
        className,
      )}
    />
  );
}

/** The dot plus the phase in words, e.g. "● Registration open". */
export function PhaseLabel({
  phase,
  className,
}: {
  phase: EventPhase;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <PhaseDot phase={phase} />
      {PHASE_LABEL[phase]}
    </span>
  );
}
