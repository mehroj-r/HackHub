import { describe, expect, it } from "vitest";

import { isAfterLastDay } from "./event-dates";
import {
  compareByStatus,
  eventStatus,
  parseStatusFilter,
  type EventStatus,
} from "./event-status";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const closed = {
  registrationOpen: false,
  submissionsOpen: false,
  resultsPublished: false,
  hasSubmissions: false,
};
// "Now" is 28 Oct 2026, 12:00 in Tashkent (07:00 UTC).
const NOW = new Date("2026-10-28T07:00:00.000Z");

describe("eventStatus", () => {
  it("is live while registration or submissions are open", () => {
    expect(
      eventStatus(
        { ...closed, registrationOpen: true, endDate: day("2026-11-08") },
        NOW,
      ),
    ).toBe("live");
    expect(
      eventStatus(
        { ...closed, submissionsOpen: true, endDate: day("2026-10-01") },
        NOW,
      ),
    ).toBe("live");
  });

  it("is upcoming when it hasn't opened and hasn't ended", () => {
    expect(eventStatus({ ...closed, endDate: day("2026-11-08") }, NOW)).toBe(
      "upcoming",
    );
    // Its last day is today: still upcoming until the day is over.
    expect(eventStatus({ ...closed, endDate: day("2026-10-28") }, NOW)).toBe(
      "upcoming",
    );
  });

  it("is finished when it never opened and its last day is over (past-dated)", () => {
    expect(eventStatus({ ...closed, endDate: day("2026-10-25") }, NOW)).toBe(
      "finished",
    );
  });

  it("is judging once teams submitted and submissions closed", () => {
    expect(
      eventStatus(
        { ...closed, hasSubmissions: true, endDate: day("2026-10-25") },
        NOW,
      ),
    ).toBe("judging");
  });

  it("is finished once results are published, whatever the dates", () => {
    expect(
      eventStatus(
        {
          ...closed,
          resultsPublished: true,
          hasSubmissions: true,
          endDate: day("2026-12-01"),
        },
        NOW,
      ),
    ).toBe("finished");
  });
});

describe("isAfterLastDay (GMT+5 boundary)", () => {
  // The last day is 28 Oct; it ends at 29 Oct 00:00 in Tashkent = 28 Oct 19:00 UTC.
  const end = day("2026-10-28");
  it("is false until the last minute of the day in Tashkent", () => {
    expect(isAfterLastDay(end, new Date("2026-10-28T18:59:59.999Z"))).toBe(
      false,
    );
  });
  it("is true from midnight in Tashkent", () => {
    expect(isAfterLastDay(end, new Date("2026-10-28T19:00:00.000Z"))).toBe(
      true,
    );
  });
  it("drives the upcoming/finished switch for a never-opened event", () => {
    expect(
      eventStatus(
        { ...closed, endDate: end },
        new Date("2026-10-28T18:59:00Z"),
      ),
    ).toBe("upcoming");
    expect(
      eventStatus(
        { ...closed, endDate: end },
        new Date("2026-10-28T19:00:00Z"),
      ),
    ).toBe("finished");
  });
});

describe("parseStatusFilter", () => {
  it("takes the known values and falls back to all", () => {
    expect(parseStatusFilter("live")).toBe("live");
    expect(parseStatusFilter("finished")).toBe("finished");
    expect(parseStatusFilter(["judging", "live"])).toBe("judging");
    expect(parseStatusFilter(undefined)).toBe("all");
    expect(parseStatusFilter("LIVE")).toBe("all");
    expect(parseStatusFilter("<script>")).toBe("all");
  });
});

describe("compareByStatus", () => {
  const e = (name: string, status: EventStatus, start: string) => ({
    name,
    status,
    startDate: day(start),
  });

  it("orders Live, Upcoming, Judging, Finished, then by start date per group", () => {
    const events = [
      e("Old finished", "finished", "2026-09-01"),
      e("Late upcoming", "upcoming", "2026-12-10"),
      e("Judging", "judging", "2026-10-24"),
      e("New finished", "finished", "2026-10-10"),
      e("Live later", "live", "2026-11-07"),
      e("Soon upcoming", "upcoming", "2026-11-20"),
      e("Live sooner", "live", "2026-10-30"),
    ];
    expect([...events].sort(compareByStatus).map((x) => x.name)).toEqual([
      "Live sooner",
      "Live later",
      "Soon upcoming",
      "Late upcoming",
      "Judging",
      "New finished",
      "Old finished",
    ]);
  });

  it("breaks a same-day tie by name", () => {
    const a = e("Alpha", "upcoming", "2026-11-01");
    const b = e("Beta", "upcoming", "2026-11-01");
    expect([b, a].sort(compareByStatus).map((x) => x.name)).toEqual([
      "Alpha",
      "Beta",
    ]);
  });
});
