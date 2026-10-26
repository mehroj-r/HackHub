import type { Role } from "@/generated/prisma/enums";

// The permission matrix from docs/03-architecture.md as data. The UI uses
// can() to decide which actions and nav items to show; server code calls
// requireRole() from ./dal with explicit roles instead, so every guard can be
// found with a search. Safe to import from client components.

/** Where each role lands after login, and after opening a page it may not see. */
export const ROLE_HOME: Record<Role, string> = {
  PARTICIPANT: "/my-events",
  JUDGE: "/judge",
  ORGANIZER: "/organizer",
};

/** One action per row of the matrix, in the same order. */
export type Action =
  | "profile:edit-own"
  | "events:browse"
  | "event:register"
  | "team:manage"
  | "submission:submit"
  | "judging:view-teams"
  | "judging:score"
  | "judging:comment"
  | "comments:read-own-team"
  | "events:manage"
  | "criteria:manage"
  | "event:toggle-registration-and-submissions"
  | "event:view-all-entries"
  | "users:assign-judge"
  | "judging:auto-assign"
  | "ranking:preview-and-publish"
  | "ranking:view-published";

const EVERYONE: Role[] = ["PARTICIPANT", "JUDGE", "ORGANIZER"];

export const PERMISSIONS: Record<Action, Role[]> = {
  "profile:edit-own": EVERYONE,
  "events:browse": EVERYONE,
  "event:register": ["PARTICIPANT"],
  "team:manage": ["PARTICIPANT"],
  "submission:submit": ["PARTICIPANT"],
  // Every judge sees and scores every team (Decision 1).
  "judging:view-teams": ["JUDGE"],
  "judging:score": ["JUDGE"],
  "judging:comment": ["JUDGE"],
  "comments:read-own-team": ["PARTICIPANT", "ORGANIZER"],
  "events:manage": ["ORGANIZER"],
  "criteria:manage": ["ORGANIZER"],
  "event:toggle-registration-and-submissions": ["ORGANIZER"],
  "event:view-all-entries": ["ORGANIZER"],
  "users:assign-judge": ["ORGANIZER"],
  "judging:auto-assign": ["ORGANIZER"],
  "ranking:preview-and-publish": ["ORGANIZER"],
  "ranking:view-published": EVERYONE,
};

/** Whether a role may take an action. Signed-out visitors (no role) may not. */
export function can(role: Role | null | undefined, action: Action): boolean {
  return role != null && PERMISSIONS[action].includes(role);
}
