import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";

// One result shape for every server action (docs/07 > One result shape for
// every action). An action is `(prev: ActionState, formData: FormData) =>
// Promise<ActionState>`, with any bound ids in front. Client components only
// need the type: `import type { ActionState } from "@/lib/action-state"`.

export type ActionState =
  | { ok: true; message?: string }
  | {
      ok: false;
      fieldErrors?: Record<string, string[]>;
      formError?: string;
      /** The submitted strings, for the inputs' defaultValue after a failure. */
      values?: Record<string, string>;
    }
  | null; // initial state for useActionState

/** A product rule said no. The message is shown to the user as `formError`. */
export class RuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuleError";
  }
}

/** Invalid input: errors next to the fields that caused them. */
export function fromZodError(e: z.ZodError): ActionState {
  const fieldErrors: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(
    z.flattenError(e).fieldErrors as Record<string, string[] | undefined>,
  )) {
    if (messages?.length) fieldErrors[field] = messages;
  }
  return { ok: false, fieldErrors };
}

/** A unique constraint refused the write (Prisma P2002), e.g. a double-click on Register. */
export function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}
