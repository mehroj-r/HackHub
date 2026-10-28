import { describe, expect, it } from "vitest";

import {
  normalizePhone,
  profileFormSchema,
  profileSchema,
  readProfileForm,
} from "@/lib/validation/profile";

// docs/08 > /profile, docs/06 TC-09, TC-11.

const valid = {
  name: "Ana Karimova",
  faculty: "Computer Science",
  phone: "+998901234567",
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

describe("profileSchema phone", () => {
  const phoneOf = (phone: unknown) =>
    profileSchema.parse({ ...valid, phone }).phone;

  it("is optional: blank or missing is null", () => {
    expect(phoneOf("")).toBeNull();
    expect(phoneOf("   ")).toBeNull();
    expect(phoneOf(undefined)).toBeNull();
    const { phone: _p, ...rest } = valid;
    void _p;
    expect(profileSchema.parse(rest).phone).toBeNull();
  });

  it("turns a 9-digit Uzbek local number into +998…", () => {
    expect(phoneOf("901234567")).toBe("+998901234567");
    expect(phoneOf("90 123-45-67")).toBe("+998901234567");
    expect(phoneOf("(90) 123.45.67")).toBe("+998901234567");
  });

  it("adds the plus to 998… and keeps +998…", () => {
    expect(phoneOf("998901234567")).toBe("+998901234567");
    expect(phoneOf("998 90 123 45 67")).toBe("+998901234567");
    expect(phoneOf(" +998 (90) 123-45-67 ")).toBe("+998901234567");
  });

  it("keeps other numbers' digits and leading plus", () => {
    expect(phoneOf("+44 7911 123456")).toBe("+447911123456");
    expect(phoneOf("+1 (415) 555-0100")).toBe("+14155550100");
    expect(phoneOf("0901234567")).toBe("0901234567");
  });

  it("refuses letters, too few or too many digits, and a stray plus", () => {
    for (const bad of [
      "12ab",
      "12345678",
      "+12345678",
      "1234567890123456",
      "90+1234567",
      "++998901234567",
      "phone",
    ]) {
      expect(errors({ ...valid, phone: bad })).toEqual({
        phone: ["Enter a phone number like +998 90 123 45 67."],
      });
    }
  });
});

describe("normalizePhone", () => {
  it("is null for anything that isn't a phone", () => {
    expect(normalizePhone("12ab")).toBeNull();
    expect(normalizePhone("")).toBeNull();
  });

  it("gives the stored form", () => {
    expect(normalizePhone("90 123 45 67")).toBe("+998901234567");
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
      phone: "",
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

// The form's validate-as-you-go reads the form field by field, so a lone
// skill or link arrives as a string and none as nothing.
describe("profileFormSchema", () => {
  it("treats a lone skill and link as lists", () => {
    const result = profileFormSchema.safeParse({
      ...valid,
      skills: "React",
      links: "https://github.com/ana",
    });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      skills: ["React"],
      links: ["https://github.com/ana"],
    });
  });

  it("treats missing skills and links as empty lists", () => {
    const { skills: _s, links: _l, ...rest } = valid;
    void _s;
    void _l;
    expect(profileFormSchema.safeParse(rest).success).toBe(true);
  });

  it("checks the phone with the server's rule", () => {
    const result = profileFormSchema.safeParse({ ...valid, phone: "12ab" });
    expect(result.success).toBe(false);
    expect(result.error!.issues.map((i) => [i.path[0], i.message])).toEqual([
      ["phone", "Enter a phone number like +998 90 123 45 67."],
    ]);
  });

  it("keeps the server's messages", () => {
    const result = profileFormSchema.safeParse({
      ...valid,
      name: "",
      links: "github.com/ana",
    });
    expect(result.success).toBe(false);
    const byField = Object.fromEntries(
      result.error!.issues.map((i) => [String(i.path[0]), i.message]),
    );
    expect(byField).toEqual({
      name: "Enter your name.",
      links: "Enter a full link starting with https://.",
    });
  });
});
