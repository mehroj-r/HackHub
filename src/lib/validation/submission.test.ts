import { describe, expect, it } from "vitest";

import {
  readSubmissionForm,
  submissionSchema,
} from "@/lib/validation/submission";

// docs/08 > Submit project, docs/06 TC-64, TC-65, TC-70.

const valid = {
  title: "HackHub Judge Helper",
  description: "Scores teams fairly.",
  repoUrl: "https://github.com/team/project",
};

/** field → messages, the shape the form shows under each input. */
const errors = (input: unknown) => {
  const result = submissionSchema.safeParse(input);
  if (result.success) return {};
  const byField: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    (byField[String(issue.path[0])] ??= []).push(issue.message);
  }
  return byField;
};

const BAD_LINK = "Enter a valid link, like https://github.com/team/project.";

describe("submissionSchema", () => {
  it("accepts a submission and trims every field", () => {
    expect(
      submissionSchema.parse({
        title: "  HackHub Judge Helper ",
        description: " Scores teams fairly. ",
        repoUrl: " https://github.com/team/project ",
      }),
    ).toEqual(valid);
  });

  it("needs every field (TC-64, TC-70)", () => {
    expect(errors({ title: " ", description: "", repoUrl: "" })).toEqual({
      title: ["Enter a project title."],
      description: ["Add a description."],
      repoUrl: [BAD_LINK],
    });
  });

  it("caps the title at 100 and the description at 2000 characters", () => {
    expect(
      submissionSchema.safeParse({
        ...valid,
        title: "a".repeat(100),
        description: "a".repeat(2000),
      }).success,
    ).toBe(true);
    expect(
      errors({
        ...valid,
        title: "a".repeat(101),
        description: "a".repeat(2001),
      }),
    ).toEqual({
      title: ["Keep the title under 100 characters."],
      description: ["Keep the description under 2000 characters."],
    });
  });

  it("accepts http and https repository links (TC-65)", () => {
    for (const url of [
      "https://github.com/team/project",
      "http://gitlab.example.org/team/project",
    ]) {
      expect(
        submissionSchema.safeParse({ ...valid, repoUrl: url }).success,
      ).toBe(true);
    }
  });

  it("refuses anything that isn't a full http(s) link (TC-65)", () => {
    for (const url of [
      "github.com/team/project",
      "ftp://github.com/team/project",
      "javascript:alert(1)",
      "https://",
      "not a link",
    ]) {
      expect(errors({ ...valid, repoUrl: url })).toEqual({
        repoUrl: [BAD_LINK],
      });
    }
  });
});

describe("readSubmissionForm", () => {
  it("reads the three fields, with missing ones as empty strings", () => {
    const form = new FormData();
    form.set("title", "Project");
    form.set("repoUrl", "https://github.com/team/project");

    expect(readSubmissionForm(form)).toEqual({
      title: "Project",
      description: "",
      repoUrl: "https://github.com/team/project",
    });
  });
});
