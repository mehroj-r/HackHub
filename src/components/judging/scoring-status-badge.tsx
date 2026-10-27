import { CheckIcon, CircleDashedIcon, CircleDotIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SCORING_STATUS_LABEL, type ScoringStatus } from "@/lib/domain/scoring";

const ICON = { NOT_STARTED: CircleDashedIcon, IN_PROGRESS: CircleDotIcon, SCORED: CheckIcon };

/**
 * "To score" / "In progress" / "Scored": text and an icon, never colour alone.
 * Only "Scored" uses the success green (DESIGN.md > Badges).
 */
export function ScoringStatusBadge({ status }: { status: ScoringStatus }) {
  const Icon = ICON[status];
  return (
    <Badge
      variant={status === "IN_PROGRESS" ? "secondary" : "outline"}
      className={
        status === "SCORED"
          ? "shrink-0 gap-1 border-transparent bg-success text-success-foreground"
          : "shrink-0 gap-1"
      }
    >
      <Icon aria-hidden />
      {SCORING_STATUS_LABEL[status]}
    </Badge>
  );
}
