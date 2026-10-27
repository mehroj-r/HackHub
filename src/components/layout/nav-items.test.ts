import { describe, expect, it } from "vitest";

import { getActiveHref, getNavItems } from "./nav-items";

describe("getNavItems", () => {
  it("gives a visitor only Events", () => {
    expect(getNavItems(null).map((i) => i.href)).toEqual(["/events"]);
  });

  it("matches the docs/08 App shell table for each role", () => {
    expect(getNavItems("PARTICIPANT").map((i) => i.href)).toEqual([
      "/events",
      "/my-events",
    ]);
    expect(getNavItems("JUDGE").map((i) => i.href)).toEqual([
      "/judge",
      "/events",
    ]);
    expect(getNavItems("ORGANIZER").map((i) => i.href)).toEqual([
      "/organizer",
      "/organizer/users",
      "/events",
    ]);
  });
});

describe("getActiveHref", () => {
  const organizer = getNavItems("ORGANIZER");
  const participant = getNavItems("PARTICIPANT");

  it("marks the item for the current section", () => {
    expect(getActiveHref(participant, "/events")).toBe("/events");
    expect(getActiveHref(participant, "/events/abc/team")).toBe("/events");
    expect(getActiveHref(participant, "/my-events")).toBe("/my-events");
  });

  it("does not confuse /my-events with /events", () => {
    expect(getActiveHref(participant, "/my-events")).not.toBe("/events");
  });

  it("prefers the longest match for the organizer", () => {
    expect(getActiveHref(organizer, "/organizer")).toBe("/organizer");
    expect(getActiveHref(organizer, "/organizer/events/abc/criteria")).toBe(
      "/organizer",
    );
    expect(getActiveHref(organizer, "/organizer/users")).toBe(
      "/organizer/users",
    );
  });

  it("returns null when no item matches", () => {
    expect(getActiveHref(participant, "/profile")).toBeNull();
    expect(getActiveHref(participant, "/")).toBeNull();
  });
});
