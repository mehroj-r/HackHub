import { describe, expect, it } from "vitest";

import { formatPhone, phoneHref, phoneMatches } from "@/lib/format/phone";

describe("formatPhone", () => {
  it("groups an Uzbek number the local way", () => {
    expect(formatPhone("+998901234567")).toBe("+998 90 123 45 67");
    expect(formatPhone("+998331112233")).toBe("+998 33 111 22 33");
  });

  it("shows other numbers as stored", () => {
    expect(formatPhone("+447911123456")).toBe("+447911123456");
    expect(formatPhone("+99890123456")).toBe("+99890123456");
    expect(formatPhone("0901234567")).toBe("0901234567");
  });
});

describe("phoneHref", () => {
  it("links the stored number", () => {
    expect(phoneHref("+998901234567")).toBe("tel:+998901234567");
  });
});

describe("phoneMatches", () => {
  const stored = "+998908865412";

  it("finds the phone by part of its digits, with any separators", () => {
    for (const q of [
      "88654",
      "886-54",
      "886 54",
      "886.54",
      "(90) 886",
      "+998 90 886-54-12",
      " 998908865412 ",
    ]) {
      expect(phoneMatches(q, stored)).toBe(true);
    }
  });

  it("misses other digits, letters, a blank query and no phone", () => {
    expect(phoneMatches("886-55", stored)).toBe(false);
    expect(phoneMatches("ali", stored)).toBe(false);
    expect(phoneMatches("886a", stored)).toBe(false);
    expect(phoneMatches(" - ", stored)).toBe(false);
    expect(phoneMatches("886", null)).toBe(false);
  });
});
