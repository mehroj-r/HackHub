import { describe, expect, it } from "vitest";

import { eventPhase, isLivePhase, PHASE_LABEL } from "./event-phase";

const closed = {
  registrationOpen: false,
  submissionsOpen: false,
  resultsPublished: false,
};

describe("eventPhase", () => {
  it("is upcoming when nothing is open and nobody submitted", () => {
    expect(eventPhase(closed)).toBe("upcoming");
  });

  it("follows the switches", () => {
    expect(eventPhase({ ...closed, registrationOpen: true })).toBe("registration");
    expect(eventPhase({ ...closed, submissionsOpen: true })).toBe("building");
    // Registration and submissions open together: teams are building.
    expect(
      eventPhase({ ...closed, registrationOpen: true, submissionsOpen: true }),
    ).toBe("building");
  });

  it("is judging once submissions closed with something submitted", () => {
    expect(eventPhase({ ...closed, hasSubmissions: true })).toBe("judging");
  });

  it("is results once published, whatever else is set", () => {
    expect(
      eventPhase({ ...closed, resultsPublished: true, registrationOpen: true }),
    ).toBe("results");
  });
});

describe("isLivePhase", () => {
  it("is live only while registration or submissions are open", () => {
    expect(isLivePhase("registration")).toBe(true);
    expect(isLivePhase("building")).toBe(true);
    expect(isLivePhase("judging")).toBe(false);
    expect(isLivePhase("results")).toBe(false);
    expect(isLivePhase("upcoming")).toBe(false);
  });

  it("has a label for every phase", () => {
    expect(Object.keys(PHASE_LABEL)).toHaveLength(5);
  });
});
