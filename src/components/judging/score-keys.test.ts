import { describe, expect, it } from "vitest";

import { canExtend, typeDigit } from "./score-keys";

describe("typeDigit", () => {
  it("sets a single digit within range", () => {
    expect(typeDigit("", "7", 10)).toEqual({ value: 7, buffer: "7" });
    expect(typeDigit("", "0", 10)).toEqual({ value: 0, buffer: "0" });
  });

  it("builds two-digit scores typed quickly", () => {
    expect(typeDigit("1", "0", 10)).toEqual({ value: 10, buffer: "10" });
    expect(typeDigit("2", "5", 30)).toEqual({ value: 25, buffer: "25" });
  });

  it("starts again when the longer number would be out of range", () => {
    expect(typeDigit("1", "5", 10)).toEqual({ value: 5, buffer: "5" });
    expect(typeDigit("10", "3", 10)).toEqual({ value: 3, buffer: "3" });
  });

  it("ignores a digit above the max, and anything that isn't a digit", () => {
    expect(typeDigit("", "7", 5)).toBeNull();
    expect(typeDigit("", "e", 10)).toBeNull();
    expect(typeDigit("", "-", 10)).toBeNull();
  });

  it("doesn't build numbers with a leading zero", () => {
    expect(typeDigit("0", "7", 10)).toEqual({ value: 7, buffer: "7" });
  });
});

describe("canExtend", () => {
  it("is true only while another digit could still fit", () => {
    expect(canExtend("1", 10)).toBe(true);
    expect(canExtend("2", 10)).toBe(false);
    expect(canExtend("0", 10)).toBe(false);
    expect(canExtend("", 10)).toBe(false);
    expect(canExtend("3", 100)).toBe(true);
  });
});
