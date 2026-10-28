import { describe, expect, it } from "vitest";

import { canSeePhone } from "@/lib/domain/profile";

describe("canSeePhone", () => {
  it("lets the owner see their own phone", () => {
    expect(canSeePhone({ id: "a", role: "PARTICIPANT" }, "a")).toBe(true);
    expect(canSeePhone({ id: "j", role: "JUDGE" }, "j")).toBe(true);
  });

  it("lets an organizer see anyone's phone", () => {
    expect(canSeePhone({ id: "o", role: "ORGANIZER" }, "a")).toBe(true);
  });

  it("hides it from other participants and judges", () => {
    expect(canSeePhone({ id: "b", role: "PARTICIPANT" }, "a")).toBe(false);
    expect(canSeePhone({ id: "j", role: "JUDGE" }, "a")).toBe(false);
  });
});
