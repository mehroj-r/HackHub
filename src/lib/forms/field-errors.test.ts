import { describe, expect, it } from "vitest";
import { z } from "zod";

import { fieldErrorsFrom, valuesFromEntries } from "./field-errors";

const schema = z
  .object({
    name: z.string().trim().min(1, "Enter a name.").max(5, "Too long."),
    start: z.string().min(1, "Choose a start date."),
    end: z.string().min(1, "Choose an end date."),
  })
  .refine((v) => !v.start || !v.end || v.end >= v.start, {
    path: ["end"],
    message: "The end date can't be before the start date.",
  });

describe("fieldErrorsFrom", () => {
  it("returns nothing for valid values", () => {
    expect(
      fieldErrorsFrom(schema, { name: "Ok", start: "2026-10-28", end: "2026-10-29" }),
    ).toEqual({});
  });

  it("keeps the first message per field, like the server", () => {
    expect(fieldErrorsFrom(schema, { name: "  ", start: "", end: "" })).toEqual({
      name: "Enter a name.",
      start: "Choose a start date.",
      end: "Choose an end date.",
    });
  });

  it("runs transforms and cross-field rules over the whole form", () => {
    const errors = fieldErrorsFrom(schema, {
      name: "Ok",
      start: "2026-10-29",
      end: "2026-10-28",
    });
    expect(errors).toEqual({ end: "The end date can't be before the start date." });
  });
});

describe("valuesFromEntries", () => {
  it("collects repeated names into arrays and skips Next.js's hidden inputs", () => {
    expect(
      valuesFromEntries([
        ["name", "Team"],
        ["skills", "React"],
        ["skills", "Go"],
        ["skills", "SQL"],
        ["$ACTION_ID_abc", ""],
      ]),
    ).toEqual({ name: "Team", skills: ["React", "Go", "SQL"] });
  });
});
