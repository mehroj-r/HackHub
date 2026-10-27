import { describe, expect, it } from "vitest";

import { allDone, participantProgress } from "@/lib/domain/participant-progress";

const none = {
  profileComplete: false,
  registered: false,
  onTeam: false,
  submitted: false,
};
const all = { profileComplete: true, registered: true, onTeam: true, submitted: true };

describe("participantProgress", () => {
  it("lists Profile, Registered, Team, Submitted in order", () => {
    expect(participantProgress("e1", none).map((s) => s.label)).toEqual([
      "Profile",
      "Registered",
      "Team",
      "Submitted",
    ]);
  });

  it("marks the first step not done as current", () => {
    const steps = participantProgress("e1", {
      ...none,
      profileComplete: true,
      registered: true,
    });
    expect(steps.map((s) => s.current)).toEqual([false, false, true, false]);
    expect(steps.map((s) => s.done)).toEqual([true, true, false, false]);
  });

  it("links each step to where it's completed", () => {
    const steps = participantProgress("e1", { ...none, onTeam: true });
    expect(steps.map((s) => s.href)).toEqual([
      "/profile",
      "/events/e1",
      "/events/e1/team",
      "/events/e1/team/submit",
    ]);
  });

  it("sends Submitted to the team page while there's no team", () => {
    expect(participantProgress("e1", none)[3]!.href).toBe("/events/e1/team");
  });

  it("is all done only when every step is, with no current step", () => {
    expect(allDone(participantProgress("e1", all))).toBe(true);
    expect(participantProgress("e1", all).some((s) => s.current)).toBe(false);
    expect(allDone(participantProgress("e1", { ...all, submitted: false }))).toBe(false);
  });
});
