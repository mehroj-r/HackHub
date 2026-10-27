import { describe, expect, it } from "vitest";

import {
  EVENT_GRADIENTS,
  EVENT_PATTERNS,
  eventArt,
  eventInitials,
  nameHash,
} from "./event-art";

describe("nameHash", () => {
  it("is stable: the same name always gives the same number", () => {
    expect(nameHash("Open Hack · live")).toBe(nameHash("Open Hack · live"));
    // Known value, so a change to the hash (and every event's colours) is noticed.
    expect(nameHash("")).toBe(0x811c9dc5);
  });

  it("ignores surrounding spaces and letter case", () => {
    expect(nameHash("  Demo Hack ")).toBe(nameHash("demo hack"));
  });
});

describe("eventArt", () => {
  it("gives the same name the same gradient and pattern every time", () => {
    const a = eventArt("Demo Hack · judging");
    for (let i = 0; i < 5; i++) {
      expect(eventArt("Demo Hack · judging")).toEqual(a);
    }
  });

  it("always picks a preset that exists", () => {
    for (const name of [
      "A",
      "Open Hack · live",
      "Ёлка",
      "🚀",
      "x".repeat(200),
    ]) {
      const art = eventArt(name);
      expect(EVENT_GRADIENTS).toContain(art.gradient);
      expect(EVENT_PATTERNS).toContain(art.pattern);
    }
  });

  it("tells the demo events apart", () => {
    const names = [
      "Open Hack · live",
      "Spring Code Sprint",
      "AI for Good Jam",
      "Demo Hack · judging",
    ];
    const arts = names.map(
      (n) => `${eventArt(n).gradient}|${eventArt(n).pattern}`,
    );
    expect(new Set(arts).size).toBe(names.length);
  });

  it("spreads different names over several gradients", () => {
    const names = Array.from({ length: 40 }, (_, i) => `Hackathon ${i}`);
    const used = new Set(names.map((n) => eventArt(n).gradient));
    expect(used.size).toBeGreaterThanOrEqual(5);
  });

  it("draws only from the Scoreboard hues (amber, live red, ember, gold, brown)", () => {
    const allowed = new Set(["primary", "live", "chart-3", "chart-4", "chart-5"]);
    for (const g of EVENT_GRADIENTS) {
      const stops = [...g.matchAll(/(?:^|\s)(?:from|via|to)-([a-z0-9-]+)/g)].map((m) => m[1]);
      expect(stops).toHaveLength(3);
      for (const stop of stops) expect(allowed).toContain(stop);
    }
  });

  it("uses theme tokens only, never raw colours", () => {
    for (const g of EVENT_GRADIENTS) {
      expect(g).not.toMatch(
        /#|rgb|oklch|\b(red|blue|green|purple|violet|lime|gray|slate)-\d/,
      );
    }
  });
});

describe("eventInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(eventInitials("Open Hack · live")).toBe("OH");
    expect(eventInitials("demo hack")).toBe("DH");
  });

  it("takes two letters of a single word", () => {
    expect(eventInitials("Hackathon")).toBe("HA");
    expect(eventInitials("X")).toBe("X");
  });

  it("skips symbols and falls back to ?", () => {
    expect(eventInitials("· 2026 · Spring")).toBe("2S");
    expect(eventInitials("—")).toBe("?");
  });
});
