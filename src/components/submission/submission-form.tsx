"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { SavedTick } from "@/components/feedback/saved-tick";
import { ActionDock } from "@/components/layout/action-dock";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/action-state";
import { useActionResult } from "@/lib/forms/use-action-result";
import { useFieldValidation } from "@/lib/forms/use-field-validation";
import { submissionSchema } from "@/lib/validation/submission";

// The submit form (docs/08 > Submit project), validating as you go (redesign
// > Forms): each field is checked on blur with the same zod schema the
// action uses, the error sits under the field, and the field keeps its value.
// Fields are controlled, so values also survive React's form reset after the
// action returns. The server's result is the one that counts; its field
// errors still land under the fields.

export type SubmissionValues = {
  title: string;
  description: string;
  repoUrl: string;
};

const MAX_DESCRIPTION = 2000;

export function SubmissionForm({
  action,
  initial,
  teamHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** The saved submission, or null before the team's first submit. */
  initial: SubmissionValues | null;
  /** Where the first submit goes on to (the team page). */
  teamHref: string;
}) {
  const router = useRouter();
  // Read once: the page re-renders with the saved row in the same update as
  // the action's result.
  const [isFirstSubmit, setIsFirstSubmit] = useState(initial === null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData);
      // A short "Saved" tick after an edit (the first submit moves on).
      if (result?.ok && !isFirstSubmit) setSavedAt(Date.now());
      return result;
    },
    null,
  );

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [repoUrl, setRepoUrl] = useState(initial?.repoUrl ?? "");

  const v = useFieldValidation(
    submissionSchema,
    state?.ok === false ? state.fieldErrors : undefined,
  );

  useActionResult(state, (result) => {
    if (!result.ok) return;
    toast.success(result.message);
    if (!isFirstSubmit) return;
    // The kept-alive form doesn't remount: later saves are edits.
    setIsFirstSubmit(false);
    router.push(teamHref);
  });

  /** The hook's props, with our own onChange keeping the controlled value. */
  function wire<E extends HTMLInputElement | HTMLTextAreaElement>(
    name: keyof SubmissionValues,
    set: (value: string) => void,
  ) {
    const props = v.fieldProps(name);
    return {
      ...props,
      onChange: (e: React.ChangeEvent<E>) => {
        set(e.target.value);
        props.onChange(e);
      },
    };
  }

  const titleError = v.errorFor("title");
  const descriptionError = v.errorFor("description");
  const repoError = v.errorFor("repoUrl");

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {state?.ok === false && state.formError && (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(titleError)}>
          <FieldLabel htmlFor="title">Project title</FieldLabel>
          <Input
            id="title"
            maxLength={100}
            value={title}
            {...wire<HTMLInputElement>("title", setTitle)}
          />
          <FieldError id={v.errorId("title")}>{titleError}</FieldError>
        </Field>

        <Field data-invalid={Boolean(descriptionError)}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            rows={8}
            className="min-h-40"
            value={description}
            {...wire<HTMLTextAreaElement>("description", setDescription)}
            aria-describedby={
              descriptionError
                ? `description-count ${v.errorId("description")}`
                : "description-count"
            }
          />
          <FieldDescription
            id="description-count"
            aria-live="polite"
            className="tabular-nums"
          >
            {description.length} / {MAX_DESCRIPTION} characters
          </FieldDescription>
          <FieldError id={v.errorId("description")}>
            {descriptionError}
          </FieldError>
        </Field>

        <Field data-invalid={Boolean(repoError)}>
          <FieldLabel htmlFor="repoUrl">Repository link</FieldLabel>
          <Input
            id="repoUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://github.com/team/project"
            value={repoUrl}
            {...wire<HTMLInputElement>("repoUrl", setRepoUrl)}
          />
          <FieldError id={v.errorId("repoUrl")}>{repoError}</FieldError>
        </Field>
      </FieldGroup>

      {isFirstSubmit && (
        <p className="text-sm text-muted-foreground">
          Submitting locks your team: nobody can join or leave after this.
        </p>
      )}
      {/* Thumb-first: the submit docks to the bottom on phones. */}
      <ActionDock className="bg-card/95 supports-[backdrop-filter]:bg-card/85 md:flex-row md:items-center md:gap-3 md:bg-transparent">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="h-11 w-full px-6 text-base md:w-auto"
        >
          {pending
            ? "Saving…"
            : isFirstSubmit
              ? "Submit project"
              : "Save changes"}
        </Button>
        {/* Phones get the toast; the tick sits beside the button from md. */}
        <SavedTick savedAt={savedAt} className="hidden md:inline-flex" />
      </ActionDock>
    </form>
  );
}
