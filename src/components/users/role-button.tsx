"use client";

import { useActionState, useId } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { useActionResult } from "@/lib/forms/use-action-result";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  to: "PARTICIPANT" | "JUDGE";
  /** Why the change isn't allowed; the button is then disabled with this text. */
  disabledReason?: string;
  /** In a table row: the reason is read out but not printed (the side panel prints it). */
  compact?: boolean;
};

/** "Make judge" / "Make participant" on one row of /organizer/users. */
export function RoleButton({ action, to, disabledReason, compact }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const reasonId = useId();

  useActionResult(state, (result) => {
    if (result.ok && result.message) toast.success(result.message);
  });

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="role" value={to} />
      <Button
        type="submit"
        variant="outline"
        disabled={pending || !!disabledReason}
        aria-describedby={disabledReason ? reasonId : undefined}
        className="h-11 md:h-9"
      >
        {pending
          ? "Saving…"
          : to === "JUDGE"
            ? "Make judge"
            : "Make participant"}
      </Button>
      {disabledReason && (
        <p
          id={reasonId}
          className={
            compact ? "sr-only" : "max-w-64 text-xs text-muted-foreground"
          }
        >
          {disabledReason}
        </p>
      )}
      {state?.ok === false && state.formError && (
        <p role="alert" className="max-w-64 text-xs text-destructive">
          {state.formError}
        </p>
      )}
    </form>
  );
}
