"use client";

import { LogOutIcon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useToastAction, type FormAction } from "./use-toast-action";

/**
 * "Leave team" with the docs/08 confirm dialog: a quiet text link (redesign >
 * Team page); the confirm button inside the dialog carries the destructive
 * style. After submitting, only the reason is shown: the server refuses a
 * leave anyway (Decision 9).
 */
export function LeaveTeamButton({
  action,
  teamName,
  isLastMember,
  submitted,
}: {
  action: FormAction;
  teamName: string;
  isLastMember: boolean;
  submitted: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useToastAction(async (prev, data) => {
    const result = await action(prev, data);
    // On success this component unmounts; on a refusal, show it on the page.
    setOpen(false);
    return result;
  });

  if (submitted) {
    return (
      <p className="flex min-h-11 items-center text-sm text-muted-foreground">
        You can&apos;t leave after your team has submitted.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {state?.ok === false && state.formError && (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}
      <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <AlertDialogTrigger asChild>
          {/* Quiet on purpose: a text link, not a button, behind a confirm. */}
          <Button
            variant="link"
            className="h-11 px-0 text-muted-foreground hover:text-foreground"
          >
            <LogOutIcon aria-hidden />
            Leave team
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {teamName}?</AlertDialogTitle>
            <AlertDialogDescription>
              {isLastMember
                ? `You're the last member, so leaving deletes ${teamName}.`
                : "You can join or create another team in this event."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={formAction}>
            <AlertDialogFooter>
              {/* Radix focuses Cancel first (docs/08 > Confirm dialog). */}
              <AlertDialogCancel
                size="lg"
                disabled={pending}
                className="h-11"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                size="lg"
                disabled={pending}
                className="h-11 text-foreground hover:text-foreground"
              >
                {pending ? "Leaving…" : "Leave team"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
