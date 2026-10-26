import { describe, expect, it } from "vitest";

import { emailSchema, passwordSchema } from "@/lib/validation/auth";

const messages = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message);

describe("emailSchema", () => {
  it("trims and lowercases the email", () => {
    expect(emailSchema.parse("  Organizer@HackHub.Test ")).toBe(
      "organizer@hackhub.test",
    );
  });

  it("asks for an email when it is empty or missing", () => {
    expect(messages(emailSchema.safeParse("   "))).toEqual([
      "Enter your email.",
    ]);
    expect(messages(emailSchema.safeParse(undefined))).toEqual([
      "Enter your email.",
    ]);
  });

  it("rejects a malformed email", () => {
    expect(messages(emailSchema.safeParse("not-an-email"))).toEqual([
      "Enter a valid email address, like name@example.com.",
    ]);
  });
});

describe("passwordSchema", () => {
  it("accepts 8 characters and refuses 7", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(true);
    expect(messages(passwordSchema.safeParse("1234567"))).toEqual([
      "Use at least 8 characters.",
    ]);
  });

  it("gives one message for an empty password", () => {
    expect(messages(passwordSchema.safeParse(""))).toEqual([
      "Enter a password.",
    ]);
  });
});
