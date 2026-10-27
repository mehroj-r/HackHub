import type { z } from "zod";

// Pure part of the validate-as-you-go pattern (use-field-validation.ts): run
// the same zod schema the server action uses over the whole form, and keep the
// first message per field. Whole-form parsing means transforms and
// cross-field rules (an end date before the start date) behave exactly as on
// the server.

export type FormValues = Record<string, unknown>;
export type FieldErrorMap = Record<string, string>;

/** The first error message for each top-level field, from the schema. */
export function fieldErrorsFrom(
  schema: z.ZodType,
  values: FormValues,
): FieldErrorMap {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrorMap = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" && typeof field !== "number") continue;
    const key = String(field);
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

/**
 * Turns form entries into the shape a schema expects: one value per name, or
 * an array when the name repeats (skills, links). Use it with
 * `new FormData(form).entries()`.
 */
export function valuesFromEntries(
  entries: Iterable<[string, FormDataEntryValue]>,
): FormValues {
  const values: FormValues = {};
  for (const [name, value] of entries) {
    if (name.startsWith("$ACTION")) continue; // Next.js's own hidden inputs
    if (!(name in values)) {
      values[name] = value;
    } else {
      const current = values[name];
      values[name] = Array.isArray(current) ? [...current, value] : [current, value];
    }
  }
  return values;
}
