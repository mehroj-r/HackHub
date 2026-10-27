"use client";

import { useCallback, useState } from "react";
import type { z } from "zod";

import {
  fieldErrorsFrom,
  valuesFromEntries,
  type FieldErrorMap,
} from "./field-errors";

// Validate as you go (redesign plan > Forms): each field is checked on blur
// with the same zod schema the server action uses; errors sit under the field
// and the field keeps its value. Once a field has an error, it re-checks as
// you type, so the message goes away as soon as it's fixed. Server errors
// (state.fieldErrors) still show, until that field is edited. The server
// result is the one that counts: this never blocks a submit.
//
// The <Field> wiring pattern:
//
//   const v = useFieldValidation(createTeamSchema, state?.ok === false ? state.fieldErrors : undefined);
//   <form action={formAction} noValidate>
//     <Field data-invalid={Boolean(v.errorFor("name"))}>
//       <FieldLabel htmlFor="name">Team name</FieldLabel>
//       <Input id="name" defaultValue={…} {...v.fieldProps("name")} />
//       <FieldError id={v.errorId("name")}>{v.errorFor("name")}</FieldError>
//     </Field>
//     <Button type="submit" disabled={pending}>…</Button>
//   </form>

type ServerErrors = Record<string, string[] | undefined> | undefined;

export function useFieldValidation(schema: z.ZodType, serverErrors?: ServerErrors) {
  // Fields the user has left at least once: only those show client errors.
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [clientErrors, setClientErrors] = useState<FieldErrorMap>({});
  // Server errors the user has since edited away, per server response.
  const [dismissed, setDismissed] = useState<{
    source: ServerErrors;
    names: ReadonlySet<string>;
  }>({ source: undefined, names: new Set() });
  const dismissedNames =
    dismissed.source === serverErrors ? dismissed.names : new Set<string>();

  const check = useCallback(
    (form: HTMLFormElement | null) =>
      form ? fieldErrorsFrom(schema, valuesFromEntries(new FormData(form).entries())) : {},
    [schema],
  );

  const errorFor = (name: string): string | undefined => {
    if (touched.has(name) && clientErrors[name]) return clientErrors[name];
    if (!dismissedNames.has(name)) return serverErrors?.[name]?.[0];
    return undefined;
  };

  const errorId = (name: string) => `${name}-error`;

  const fieldProps = (name: string) => {
    const error = errorFor(name);
    return {
      name,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId(name) : undefined,
      onBlur: (e: { currentTarget: { form: HTMLFormElement | null } }) => {
        setTouched((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));
        setClientErrors(check(e.currentTarget.form));
      },
      onChange: (e: { currentTarget: { form: HTMLFormElement | null } }) => {
        if (serverErrors?.[name] && !dismissedNames.has(name)) {
          setDismissed({
            source: serverErrors,
            names: new Set(dismissedNames).add(name),
          });
        }
        // Re-check while typing only once the field has shown an error.
        if (touched.has(name) && clientErrors[name]) {
          setClientErrors(check(e.currentTarget.form));
        }
      },
    };
  };

  return { errorFor, errorId, fieldProps };
}
