import { describe, expect, it } from "vitest";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { fromZodError, isUniqueViolation, RuleError } from "@/lib/action-state";

// docs/07 > One result shape for every action, Error handling.

const knownError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("Request failed", {
    code,
    clientVersion: "test",
  });

describe("fromZodError", () => {
  const schema = z.object({
    name: z.string().min(1, "Enter a name."),
    weight: z.number().max(100, "Weight is at most 100."),
  });

  it("puts each message under its field", () => {
    const result = schema.safeParse({ name: "", weight: 120 });
    if (result.success) throw new Error("expected a failure");

    expect(fromZodError(result.error)).toEqual({
      ok: false,
      fieldErrors: {
        name: ["Enter a name."],
        weight: ["Weight is at most 100."],
      },
    });
  });

  it("leaves out fields that are valid", () => {
    const result = schema.safeParse({ name: "Ana", weight: 120 });
    if (result.success) throw new Error("expected a failure");

    expect(fromZodError(result.error)).toEqual({
      ok: false,
      fieldErrors: { weight: ["Weight is at most 100."] },
    });
  });

  it("keeps every message for a field", () => {
    const result = z
      .object({
        code: z
          .string()
          .length(6, "Six characters.")
          .regex(/^\d+$/, "Digits only."),
      })
      .safeParse({ code: "ab" });
    if (result.success) throw new Error("expected a failure");

    expect(fromZodError(result.error)).toEqual({
      ok: false,
      fieldErrors: { code: ["Six characters.", "Digits only."] },
    });
  });
});

describe("isUniqueViolation", () => {
  it("is true for Prisma's P2002", () => {
    expect(isUniqueViolation(knownError("P2002"))).toBe(true);
  });

  it("is false for other Prisma errors", () => {
    expect(isUniqueViolation(knownError("P2025"))).toBe(false);
    expect(isUniqueViolation(knownError("P2003"))).toBe(false);
  });

  it("is false for anything that isn't a Prisma error", () => {
    expect(isUniqueViolation(new Error("P2002"))).toBe(false);
    expect(isUniqueViolation({ code: "P2002" })).toBe(false);
    expect(isUniqueViolation(new RuleError("Team is full."))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});

describe("RuleError", () => {
  it("is an Error that carries the message to show", () => {
    const error = new RuleError("Registration is closed.");

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Registration is closed.");
  });
});
