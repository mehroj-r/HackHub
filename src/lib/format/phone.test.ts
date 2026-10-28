import { describe, expect, it } from "vitest";

import { formatPhone, phoneHref } from "@/lib/format/phone";

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
