import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { Role } from "@/generated/prisma/enums";
import {
  can,
  PERMISSIONS,
  ROLE_HOME,
  type Action,
} from "@/lib/auth/permissions";

// TC-73: PERMISSIONS must match the matrix in docs/03 row by row. The test
// reads the table itself, so changing either one without the other fails here.

const ROW_TO_ACTION: Record<string, Action> = {
  "Register / log in / edit own profile": "profile:edit-own",
  "Browse events, see schedule and brief": "events:browse",
  "Register for an event": "event:register",
  "Create, join or leave a team": "team:manage",
  "Submit a project for own team": "submission:submit",
  "See assigned teams and their submissions": "judging:view-teams",
  "Score assigned teams": "judging:score",
  "Comment on assigned teams": "judging:comment",
  "Read comments on own team": "comments:read-own-team",
  "Create or edit events, schedule and brief": "events:manage",
  "Set criteria and weights": "criteria:manage",
  "Open or close registration and submissions":
    "event:toggle-registration-and-submissions",
  "See all participants, teams and submissions": "event:view-all-entries",
  "Assign the Judge role": "users:assign-judge",
  "Run judge auto-assignment": "judging:auto-assign",
  "See the ranking before publishing / publish it":
    "ranking:preview-and-publish",
  "See the published ranking": "ranking:view-published",
};

function readMatrix(): { row: string; roles: Role[] }[] {
  const doc = readFileSync(
    join(process.cwd(), "docs/03-architecture.md"),
    "utf8",
  );
  const section = doc.split("## Permission matrix")[1].split("\n## ")[0];
  const lines = section.split("\n").filter((line) => line.startsWith("|"));
  const header = lines[0]
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
  const columns: Role[] = header
    .slice(1)
    .map((name) => name.toUpperCase() as Role);

  return lines.slice(2).map((line) => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    return {
      row: cells[0],
      roles: columns.filter((_, i) => cells[i + 1] === "✅"),
    };
  });
}

describe("permission matrix", () => {
  const matrix = readMatrix();

  it("has one action for every row of docs/03, and no others", () => {
    expect(matrix.map(({ row }) => ROW_TO_ACTION[row])).toEqual(
      Object.keys(PERMISSIONS),
    );
  });

  it.each(matrix)("$row", ({ row, roles }) => {
    expect(PERMISSIONS[ROW_TO_ACTION[row]]).toEqual(roles);
  });
});

describe("can", () => {
  it("allows only the roles listed for the action", () => {
    expect(can("ORGANIZER", "criteria:manage")).toBe(true);
    expect(can("JUDGE", "criteria:manage")).toBe(false);
    expect(can("PARTICIPANT", "team:manage")).toBe(true);
  });

  it("allows nothing without a role", () => {
    expect(can(null, "events:browse")).toBe(false);
    expect(can(undefined, "ranking:view-published")).toBe(false);
  });
});

describe("ROLE_HOME", () => {
  it("matches the role homes in docs/08", () => {
    expect(ROLE_HOME).toEqual({
      PARTICIPANT: "/my-events",
      JUDGE: "/judge",
      ORGANIZER: "/organizer",
    });
  });
});
