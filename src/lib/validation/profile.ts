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
    skills: list("skills"),
    bio: text("bio"),
    links: list("links"),
  };
}
