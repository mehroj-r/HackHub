import { z } from "zod";

// Field rules and messages from docs/08-ui-spec.md >
// /events/[eventId]/team/submit. Used by the submit action (#7).

export const submissionSchema = z.object({
  title: z
    .string({ error: "Enter a project title." })
    .trim()
    .min(1, "Enter a project title.")
    .max(100, "Keep the title under 100 characters."),
  description: z
    .string({ error: "Add a description." })
    .trim()
    .min(1, "Add a description.")
    .max(2000, "Keep the description under 2000 characters."),
  repoUrl: z
    .string({
      error: "Enter a valid link, like https://github.com/team/project.",
    })
    .trim()
    .pipe(
      z.url({
        protocol: /^https?$/,
        hostname: z.regexes.domain,
        error: "Enter a valid link, like https://github.com/team/project.",
      }),
    ),
});

export type SubmissionInput = z.output<typeof submissionSchema>;

/** The submit form's fields as plain strings for submissionSchema. */
export function readSubmissionForm(formData: FormData) {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    title: text("title"),
    description: text("description"),
    repoUrl: text("repoUrl"),
  };
}
