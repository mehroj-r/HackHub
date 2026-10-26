import { describe, expect, it } from "vitest";

import { profileSchema, readProfileForm } from "@/lib/validation/profile";

// docs/08 > /profile, docs/06 TC-09, TC-11.

const valid = {
  name: "Ana Karimova",
  faculty: "Computer Science",
  skills: ["React", "Figma"],
  bio: "I like hackathons.",
  links: ["https://github.com/ana"],
};

/** field → messages, the shape the form shows under each input. */
const errors = (input: unknown) => {
  const result = profileSchema.safeParse(input);
  if (result.success) return {};
  const byField: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);
    (byField[field] ??= []).push(issue.message);
  }
  return byField;
};

describe("profileSchema", () => {
  it("accepts a full profile and trims the text", () => {
    expect(
      profileSchema.parse({ ...valid, name: "  Ana Karimova ", bio: " Hi " }),
    ).toEqual({ ...valid, bio: "Hi" });
  });

  it("needs a name and a faculty (TC-11)", () => {
    expect(errors({ ...valid, name: "   ", faculty: "" })).toEqual({
      name: ["Enter your name."],
      faculty: ["Enter your faculty."],
    });
  });

  it("caps name and faculty at 80 characters", () => {
    expect(
      profileSchema.safeParse({ ...valid, name: "a".repeat(80) }).success,
    ).toBe(true);
    expect(errors({ ...valid, name: "a".repeat(81) })).toEqual({
      name: ["Keep the name under 80 characters."],
    });
    expect(errors({ ...valid, faculty: "a".repeat(81) })).toEqual({
      faculty: ["Keep the faculty under 80 characters."],
    });
  });

  it("makes skills, bio and links optional", () => {
    expect(
      profileSchema.parse({ ...valid, skills: [], bio: "", links: [] }),
    ).toEqual({ ...valid, skills: [], bio: null, links: [] });
  });

  it("drops blank skills and repeated skills in any letter case", () => {
    expect(
      profileSchema.parse({ ...valid, skills: [" React ", "", "react", "Go"] })
        .skills,
    ).toEqual(["React", "Go"]);
  });

  it("allows up to 10 skills of up to 30 characters", () => {
    const ten = Array.from({ length: 10 }, (_, i) => `skill-${i}`);
    expect(profileSchema.safeParse({ ...valid, skills: ten }).success).toBe(
      true,
    );
    expect(errors({ ...valid, skills: [...ten, "one-more"] })).toEqual({
      skills: ["Add up to 10 skills."],
    });
    expect(errors({ ...valid, skills: ["a".repeat(31)] })).toEqual({
      skills: ["Keep each skill under 30 characters."],
    });
  });

  it("caps the bio at 500 characters", () => {
    expect(
      profileSchema.safeParse({ ...valid, bio: "a".repeat(500) }).success,
    ).toBe(true);
    expect(errors({ ...valid, bio: "a".repeat(501) })).toEqual({
      bio: ["Keep the bio under 500 characters."],
    });
  });

  it("needs links to be full https URLs", () => {
    for (const bad of [
      "github.com/ana",
      "http://github.com/ana",
      "https://",
      "ftp://x.org",
    ]) {
      expect(errors({ ...valid, links: [bad] })).toEqual({
        links: ["Enter a full link starting with https://."],
      });
    }
  });

  it("allows up to 3 links and drops blank rows", () => {
    const three = ["https://a.dev", "https://b.dev", "https://c.dev"];
    expect(
      profileSchema.parse({ ...valid, links: [...three, "  "] }).links,
    ).toEqual(three);
    expect(errors({ ...valid, links: [...three, "https://d.dev"] })).toEqual({
      links: ["Add up to 3 links."],
    });
  });
});

describe("readProfileForm", () => {
  it("reads repeated skill and link inputs as lists", () => {
    const form = new FormData();
    form.set("name", "Ana");
    form.set("faculty", "CS");
    form.append("skills", "React");
    form.append("skills", "Go");
    form.append("links", "https://github.com/ana");

    expect(readProfileForm(form)).toEqual({
      name: "Ana",
      faculty: "CS",
      skills: ["React", "Go"],
      bio: "",
      links: ["https://github.com/ana"],
    });
  });

  it("turns missing fields into empty values, which the schema then reports", () => {
    expect(errors(readProfileForm(new FormData()))).toEqual({
      name: ["Enter your name."],
      faculty: ["Enter your faculty."],
    });
  });
});
