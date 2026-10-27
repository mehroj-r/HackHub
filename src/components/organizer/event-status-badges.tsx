import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Event status badges (docs/08 > Shared components > Status badge). Each badge
// says its state in words; the tint only adds to the label. Open states use the
// amber tint with the red "live" dot, as on the participant pages (DESIGN.md >
// Badges); the success colour stays for Registered, Submitted and Scored.

type EventFlags = {
  registrationOpen: boolean;
  submissionsOpen: boolean;
  resultsPublished: boolean;
};

function StatusBadge({
  on,
  live = on,
  children,
}: {
  on: boolean;
  live?: boolean;
  children: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(on && "border-primary/50 bg-primary/15 text-foreground")}
    >
      {live && (
        <span aria-hidden className="size-1.5 rounded-full bg-live" />
      )}
      {children}
    </Badge>
  );
}

export function EventStatusBadges({
  event,
  className,
}: {
  event: EventFlags;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Status">
      <li>
        <StatusBadge on={event.registrationOpen}>
          {event.registrationOpen ? "Registration open" : "Registration closed"}
        </StatusBadge>
      </li>
      <li>
        <StatusBadge on={event.submissionsOpen}>
          {event.submissionsOpen ? "Submissions open" : "Submissions closed"}
        </StatusBadge>
      </li>
      {event.resultsPublished && (
        <li>
          <StatusBadge on live={false}>
            Results published
          </StatusBadge>
        </li>
      )}
    </ul>
  );
}
