import type { Role } from "@/generated/prisma/enums";

// The navigation for each audience, from docs/08 > App shell. Type-only import
// of Role, so this file is safe to use from client components.

export type NavItem = { label: string; href: string };

const VISITOR_NAV: NavItem[] = [{ label: "Events", href: "/events" }];

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  PARTICIPANT: [
    { label: "Events", href: "/events" },
    { label: "My events", href: "/my-events" },
  ],
  JUDGE: [
    { label: "Judging", href: "/judge" },
    { label: "Events", href: "/events" },
  ],
  ORGANIZER: [
    { label: "Events I run", href: "/organizer" },
    { label: "Users", href: "/organizer/users" },
    { label: "Public events", href: "/events" },
  ],
};

/** Navigation items for a role, or for a signed-out visitor when `role` is null. */
export function getNavItems(role: Role | null): NavItem[] {
  return role ? NAV_BY_ROLE[role] : VISITOR_NAV;
}

/** The role as it is shown to people, e.g. in the user menu. */
export const ROLE_LABEL: Record<Role, string> = {
  PARTICIPANT: "Participant",
  JUDGE: "Judge",
  ORGANIZER: "Organizer",
};

/**
 * The href of the item for the current section, or null. When several items
 * match (/organizer and /organizer/users), the longest href wins.
 */
export function getActiveHref(items: NavItem[], pathname: string): string | null {
  let best: string | null = null;
  for (const { href } of items) {
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (best === null || href.length > best.length)) best = href;
  }
  return best;
}

// ---------------------------------------------------------------------------
// Phone bottom tab bar (redesign plan > App shell). Below md these replace the
// header navigation as the way around; the header keeps the logo and account.

export type TabIcon =
  | "events"
  | "my-events"
  | "team"
  | "profile"
  | "users"
  | "score"
  | "results";

export type TabItem = {
  label: string;
  href: string;
  icon: TabIcon;
  /** Whether this tab is the current section for a pathname. */
  match: (pathname: string) => boolean;
};

const TEAM_PATH = /^\/events\/[^/]+\/team(\/|$)/;
const under = (prefix: string) => (p: string) =>
  p === prefix || p.startsWith(`${prefix}/`);

/**
 * The tabs for a role, or none for a visitor. `teamHref` is the participant's
 * team page in their current event, or /my-events when they have none.
 */
export function getTabItems(
  role: Role | null,
  { teamHref = "/my-events" }: { teamHref?: string } = {},
): TabItem[] {
  const profile: TabItem = {
    label: "Profile",
    href: "/profile",
    icon: "profile",
    match: under("/profile"),
  };
  switch (role) {
    case "PARTICIPANT":
      return [
        {
          label: "Events",
          href: "/events",
          icon: "events",
          match: (p) => under("/events")(p) && !TEAM_PATH.test(p),
        },
        {
          label: "My events",
          href: "/my-events",
          icon: "my-events",
          match: under("/my-events"),
        },
        {
          label: "Team",
          href: teamHref,
          icon: "team",
          match: (p) => TEAM_PATH.test(p),
        },
        profile,
      ];
    case "ORGANIZER":
      return [
        {
          label: "Events",
          href: "/organizer",
          icon: "events",
          match: (p) => under("/organizer")(p) && !under("/organizer/users")(p),
        },
        {
          label: "Users",
          href: "/organizer/users",
          icon: "users",
          match: under("/organizer/users"),
        },
        profile,
      ];
    case "JUDGE":
      return [
        { label: "Score", href: "/judge", icon: "score", match: under("/judge") },
        // The judge page's "Results published" section (id="results").
        {
          label: "Results",
          href: "/judge#results",
          icon: "results",
          match: () => false,
        },
        profile,
      ];
    default:
      return [];
  }
}
