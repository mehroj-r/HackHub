import { z } from "zod";

// Field rules and messages from docs/08-ui-spec.md > /profile. Used by the
// profile form's server action (and optionally by the form for instant
// feedback; the server result is the one that counts).

/** Trimmed list items, empty ones dropped (a blank input row is not a value). */
const trimmedList = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean));

const skill = z.string().max(30, "Keep each skill under 30 characters.");

const link = z.url({
  protocol: /^https$/,
  hostname: z.regexes.domain,
  error: "Enter a full link starting with https://.",
});

export const PHONE_ERROR = "Enter a phone number like +998 90 123 45 67.";

/** Spaces, dashes, dots and brackets people type between the digits. */
const PHONE_SEPARATORS = /[\s\-.()[\]]/g;
const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;

/**
 * A typed phone number in its stored form, or null when it isn't one:
 * separators are dropped, a 9-digit Uzbek local number ("90 123 45 67") and
 * "998…" without the plus both become "+998…", and any other number keeps
 * its digits and leading "+" as typed.
 */
export function normalizePhone(input: string): string | null {
  const compact = input.trim().replace(PHONE_SEPARATORS, "");
  if (!PHONE_PATTERN.test(compact)) return null;
  if (compact.startsWith("+")) return compact;
  if (compact.length === 9) return `+998${compact}`;
  if (compact.length === 12 && compact.startsWith("998")) return `+${compact}`;
  return compact;
}

/** Optional: blank (or not sent) is null; anything else must be a phone. */
const phone = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value?.trim()) return null;
    const normalized = normalizePhone(value);
    if (normalized === null) {
      ctx.addIssue({ code: "custom", message: PHONE_ERROR });
      return z.NEVER;
    }
    return normalized;
  });

export const profileSchema = z.object({
  name: z
    .string({ error: "Enter your name." })
    .trim()
    .min(1, "Enter your name.")
    .max(80, "Keep the name under 80 characters."),
  faculty: z
    .string({ error: "Enter your faculty." })
    .trim()
    .min(1, "Enter your faculty.")
    .max(80, "Keep the faculty under 80 characters."),
  phone,
  skills: trimmedList
    // The same skill twice, in any letter case, counts once.
    .transform((items) =>
      items.filter(
        (item, i) =>
          items.findIndex(
            (other) => other.toLowerCase() === item.toLowerCase(),
          ) === i,
      ),
    )
    .pipe(z.array(skill).max(10, "Add up to 10 skills.")),
  bio: z
    .string()
    .trim()
    .max(500, "Keep the bio under 500 characters.")
    .transform((bio) => bio || null),
  links: trimmedList.pipe(z.array(link).max(3, "Add up to 3 links.")),
});

export type ProfileInput = z.output<typeof profileSchema>;

/** One value, several, or none: always a list (repeated form names). */
const asList = (value: unknown) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * profileSchema for the form's validate-as-you-go: a form read field by
 * field gives a lone skill or link as a string and none as nothing, so those
 * become lists first. Same rules and messages as the server.
 */
export const profileFormSchema = z.preprocess((input) => {
  if (typeof input !== "object" || input === null) return input;
  const values = input as Record<string, unknown>;
  return {
    ...values,
    skills: asList(values.skills),
    links: asList(values.links),
  };
}, profileSchema);

/**
 * The profile form's fields as plain values for profileSchema. Skills and
 * links are repeated inputs, so they are read with getAll().
 */
export function readProfileForm(formData: FormData) {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  const list = (key: string) =>
    formData.getAll(key).filter((v): v is string => typeof v === "string");

  return {
    name: text("name"),
    faculty: text("faculty"),
    phone: text("phone"),
    skills: list("skills"),
    bio: text("bio"),
    links: list("links"),
  };
}
