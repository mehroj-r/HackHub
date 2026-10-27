"use client";

import Link from "next/link";
import { useActionState } from "react";

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
import type { ActionState } from "@/lib/action-state";
import { DUPLICATE_EMAIL } from "@/lib/auth/messages";
import { useFieldValidation } from "@/lib/forms/use-field-validation";
import { registerSchema } from "@/lib/validation/auth";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

/**
 * docs/08 > /register, validated as you go (redesign > Forms): each field is
 * checked on blur with registerSchema, the schema the action uses, so the
 * messages match. The server result still counts; this never blocks submit.
 */
export function RegisterForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const failed = state?.ok === false ? state : null;
  const v = useFieldValidation(registerSchema, failed?.fieldErrors);

  const password = v.fieldProps("password");
  const passwordError = v.errorFor("password");

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {failed?.formError && (
        <Alert variant="destructive">
          <AlertDescription>
            {failed.formError === DUPLICATE_EMAIL ? (
              <>
                An account with this email already exists.{" "}
                <Link href="/login" className="font-medium underline">
                  Log in instead.
                </Link>
              </>
            ) : (
              failed.formError
            )}
          </AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(v.errorFor("email"))}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
            defaultValue={failed?.values?.email}
            {...v.fieldProps("email")}
          />
          <FieldError id={v.errorId("email")}>{v.errorFor("email")}</FieldError>
        </Field>

        <Field data-invalid={Boolean(passwordError)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-11"
            {...password}
            // The rule is shown before the user types (docs/08 > /register),
            // and stays described alongside any error.
            aria-describedby={["password-rule", password["aria-describedby"]]
              .filter(Boolean)
              .join(" ")}
          />
          <FieldDescription id="password-rule">At least 8 characters.</FieldDescription>
          <FieldError id={v.errorId("password")}>{passwordError}</FieldError>
        </Field>

        <Field data-invalid={Boolean(v.errorFor("confirmPassword"))}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="h-11"
            {...v.fieldProps("confirmPassword")}
          />
          <FieldError id={v.errorId("confirmPassword")}>
            {v.errorFor("confirmPassword")}
          </FieldError>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={pending}
        className="h-11 text-base motion-safe:transition-transform motion-safe:active:scale-[0.98]"
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
