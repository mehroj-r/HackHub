"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { useFieldValidation } from "@/lib/forms/use-field-validation";
import { loginSchema } from "@/lib/validation/auth";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Where to go after logging in; checked again on the server. */
  callbackUrl: string | null;
};

/**
 * docs/08 > /login, validated as you go with loginSchema (only "is it
 * there"): a wrong email or password is one message from the server, so the
 * form never hints which one was wrong (TC-51).
 */
export function LoginForm({ action, callbackUrl }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const failed = state?.ok === false ? state : null;
  const v = useFieldValidation(loginSchema, failed?.fieldErrors);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {failed?.formError && (
        <Alert variant="destructive">
          <AlertDescription>{failed.formError}</AlertDescription>
        </Alert>
      )}

      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

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

        <Field data-invalid={Boolean(v.errorFor("password"))}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11"
            {...v.fieldProps("password")}
          />
          <FieldError id={v.errorId("password")}>{v.errorFor("password")}</FieldError>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={pending}
        className="h-11 text-base"
      >
        {pending ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to HackHub?{" "}
        <Link href="/register" className="font-medium text-foreground underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
