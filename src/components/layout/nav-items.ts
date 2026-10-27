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
