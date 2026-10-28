# Plan: organizations

**Status:** deferred (planned 28 Oct 2026; not started). Nothing in this plan is built yet. The release keeps global roles.

## Why

Today roles are global (`User.role` is PARTICIPANT, JUDGE or ORGANIZER), and nothing ties people or events to an organization. That causes three problems:

- **Any organizer can manage any event by URL.** Only the "Events I run" list and the event chip are scoped, by `createdById`.
- **Every judge sees and scores every event's teams.** That's Decision 1.
- **Any organizer can see every user's phone.** That's `canSeePhone` and the organizer users page.

Real hackathons are run by organizations (clubs, universities, companies). Judges help several organizations, and participants join events from several organizations.

## Decisions (agreed with Mehroj, 28 Oct)

| Question | Decision |
|---|---|
| Role model | **A role per membership**: `(user, organization, role)`. The global `User.role` stops being used for authorization, and only a platform admin flag stays global. |
| Organizers | An ORGANIZER of **exactly one** organization. They **may also** judge or take part in **other** organizations' events, but not their own organization's. |
| Judges | Members of one or more organizations. Organizers **assign judges per event**, and **every assigned judge scores every submitted team** in that event, so the fairness rule holds within the event. |
| Adding judges | The organizer adds a judge by the **email of an existing account**. No email sending: if there's no account, the page asks the person to sign up first. |
| Participants | Events stay public. **Registering for an event makes you a PARTICIPANT member** of its organization automatically. |
| Creating organizations | A **platform admin** (`User.isAdmin`, seeded from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, e.g. `admin@hackhub.mekhroj.uz`) creates organizations and their organizer accounts. |
| Existing data | **Migrate**, don't wipe: one organization per existing organizer, with fictional, believable names (e.g. Silk Road Tech Club, Samarkand Code Community, Bukhara Digital Hub, Tashkent Builders Guild, Registan Labs). |

## Data model

```prisma
enum OrgRole { ORGANIZER JUDGE PARTICIPANT }

model Organization {
  id          String       @id @default(cuid())
  name        String                       // 2–80 chars
  slug        String       @unique         // lowercase-hyphen, from name
  createdAt   DateTime     @default(now()) @map("created_at")
  memberships Membership[]
  events      Event[]
  @@map("organizations")
}

model Membership {
  id             String       @id @default(cuid())
  userId         String       @map("user_id")
  organizationId String       @map("organization_id")
  role           OrgRole
  createdAt      DateTime     @default(now()) @map("created_at")
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@unique([userId, organizationId, role])
  @@index([organizationId, role])
  @@map("memberships")
}
// Migration SQL: CREATE UNIQUE INDEX one_organizer_org_per_user ON memberships(user_id) WHERE role = 'ORGANIZER';

model EventJudge {
  id        String   @id @default(cuid())
  eventId   String   @map("event_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([eventId, userId])
  @@map("event_judges")
}

// Event: + organizationId String (NOT NULL after backfill) + relation; + judges EventJudge[]
// User:  + isAdmin Boolean @default(false); + memberships; + judgeOf EventJudge[]
// User.role: keep the column for one release (deprecated, unused for authorization), then drop it.
// JudgeAssignment (per team, never used) can be dropped in the same release.
```

## Rules (`src/lib/domain/organizations.ts`, pure functions with unit tests)

- **Assigning a judge to an event** requires a JUDGE membership in the event's organization. Anyone registered for that event is refused.
- **Registering for an event** is refused when the user is an assigned judge of that event, or an ORGANIZER of its organization.
- **An organizer** can't be added as a judge in their own organization.
- **Removing a judge from an organization** also removes their assignments in that organization's events. It's refused if they already have scores there.
- **Unassigning a judge** stops them seeing or scoring the event. Scores already given stay.

## Guards (`src/lib/auth/dal.ts`, replacing `requireRole`)

| Guard | Behaviour |
|---|---|
| `getCurrentUser()` | Cached. `{ id, email, isAdmin, organizerOrg: {id, name} \| null, isJudgeAnywhere }` |
| `requireUser()` | Any signed-in user. Used for participant actions, together with the rules. |
| `requireAdmin()` | `isAdmin` only. |
| `requireOrganizer()` | `{ user, org }`. |
| `requireOwnedEvent(eventId)` | Organizer of the event's organization, otherwise `notFound()`. **Every** organizer page **and every organizer server action** must call it: server actions are public endpoints. |
| `requireEventJudge(eventId)`, `requireJudgeOfTeam(teamId)` | An EventJudge row must exist, otherwise `notFound()`. `saveScores` checks this **inside** its transaction. |
| `homePath(user)` | Replaces `ROLE_HOME`: admin → `/admin`, organizer → `/organizer`, assigned anywhere → `/judge`, otherwise `/my-events`. |

- **JWT:** drops `role`. Authorization already re-reads the database on every request (Decision 8).
- **`src/proxy.ts`:** only checks that a session exists for protected areas.

## Migration and backfill (one Prisma migration, idempotent SQL)

1. Create the tables, add `events.organization_id` (nullable first) and `users.is_admin`, and add the partial unique index.
2. For each user with `role = 'ORGANIZER'`, create an organization (a placeholder name from their profile; the slug made unique) and an ORGANIZER membership.
3. Set `events.organization_id` from the organization of `created_by_id`. Fail loudly if any event is left without one, then set NOT NULL.
4. For every (judge, event) pair with scores, create an EventJudge row and a JUDGE membership in that organization.
5. For every distinct (registered user, event organization), create a PARTICIPANT membership.

**Production data step after deploy** (`prisma/organizations-showcase.ts`, dry run by default):
1. Rename the 5 organizations to the fictional names, matched to their events.
2. Give each of the 15 judges memberships in 2–3 organizations.
3. Assign 3–5 organization judges to every judging and finished event that has none.
4. Create the admin.

Production's auto-deploy takes a `pg_dump` before migrations.

## What changes, by area (code map, 28 Oct)

**Organizer area** (the most urgent part: no ownership checks today):
- Every one of these calls only `requireRole("ORGANIZER")` + `requireEvent`, and all need `requireOwnedEvent`:
  - `src/app/organizer/events/[eventId]/layout.tsx`
  - `page.tsx` (command centre)
  - `actions.ts` (`setRegistrationOpen`, `setSubmissionsOpen`, `publishResults`)
  - `edit/page.tsx` + `edit/actions.ts`
  - `criteria/page.tsx` + `criteria/actions.ts` (via `src/lib/transactions/save-criteria.ts`)
  - `participants/data.ts` (`loadParticipants`, `loadTeams`, both returning phones)
  - `ranking/page.tsx`
- `src/app/organizer/page.tsx` and `src/components/layout/event-chip.tsx`: scope by `organizationId` instead of `createdById` (copy: "<Org> events").
- `src/app/organizer/events/new/actions.ts` `createEvent`: set `organizationId`.
- `src/app/organizer/users/*`, `src/components/users/*` and `src/lib/domain/roles.ts`: replace with an organization **Members** page (judges + participants, add a judge by email, remove a judge).
- **New:** the event **Judges** tab (`/organizer/events/[id]/judges`), plus a readiness warning when judging has no judges.
- The public event page's "Manage event" button shows only for the event organization's organizers.

**Judging:**
- `src/app/judge/page.tsx`: "In judging" lists only assigned events, across organizations, with each event's organization name.
- `src/lib/queries/judging.ts` `judgeTeamsInEvent`, `src/app/judge/teams/[teamId]/page.tsx` and `actions.ts` `saveScores`: check the assignment. Today they load any team by id.
- The event chip's judge branch: only assigned events.

**Auth and navigation:**
- `src/auth.ts`, `src/types/next-auth.d.ts` and `src/proxy.ts`: drop `role` from the token, and redirect via `homePath`.
- `src/lib/auth/permissions.ts`: the role matrix becomes per-organization guards.
- `src/components/layout/nav-items.ts`, `tab-bar*`, `mobile-nav.tsx` and `user-menu.tsx`: navigation is the union of the user's areas (organizer, judge if assigned, participant), with an area switcher on phones. The admin gets "Organizations".

**Participant flow:**
- `src/app/(public)/events/[eventId]/actions.ts` `registerForEvent` and `src/lib/domain/registration.ts`:
  - upsert the PARTICIPANT membership inside the register transaction;
  - enforce the refusal rules;
  - the CTA explains the refusal states.
- **Public:** "Organized by <Org>" on the event page and the event cards (/events, Happening now).

**Privacy:**
- `src/lib/domain/profile.ts` `canSeePhone`: the owner, or an organizer of an organization the owner belongs to.
- The caller is `src/app/(app)/profile/[userId]/page.tsx`.
- The organizer tables expose phones only through owned events and the organization's members.

**Admin:** new `src/app/admin/*`: list organizations, create an organization + its organizer (a new account with a temporary password, or an existing user who isn't an organizer elsewhere), rename.

**Seeds:**
- `prisma/seed.ts`: the admin, plus a default organization for the seed organizer.
- `prisma/seed-demo.ts`: two organizations, with judges assigned.
- `prisma/seed-showcase.ts`:
  - organizations, memberships and EventJudge rows, with **new PRNG draws after the existing ones**;
  - new invariants: every scorer is an assigned judge, every judge is a member, every registrant is a member;
  - update the TRUNCATE list.
- `e2e/fixtures/wide-scale-event.ts`: an organization and a judge assignment.

**Docs and copy:**
- `docs/02` (Decisions 1, 8 and 11, plus a new organization decision), `docs/03` (permission matrix), `docs/07`, `docs/08`.
- Public copy in `about`, `terms`, `privacy` (who sees phones), `contact` ("Run an event"), the landing `faq.tsx` and `lifecycle.tsx`.

**Tests affected (rough):**
- About 80 unit cases in 12 files, e.g. `dal.test.ts`, `roles.test.ts`, `permissions.test.ts`, the organizer action tests, `participants/data.test.ts`, `profile.test.ts`, `nav-items.test.ts`.
- About 10 e2e specs:
  - `organizer-own-events.spec.ts`: "open by URL" flips to expect a 404.
  - `judge.spec.ts`, `scorecard-wide-scale.spec.ts`, `profile-phone.spec.ts`.

## Split for the team (the role-agent workflow, `.claude/skills/team-task`)

| Owner | Scope | Tester |
|---|---|---|
| Abdurauf | **Foundation first:** schema, migration + backfill, guards and `homePath`, the domain rules, seeds, and replacing every `requireRole` (including `requireOwnedEvent` everywhere). Then the organizer area: the Members page and the event Judges tab. | Xurliman |
| Ollayorbek | Judging by assignment, auth (JWT, proxy, redirects), and `/admin`. | Mehroj |
| Xurliman | Multi-area navigation and the area switcher, joining an organization on registration plus the refusals, "Organized by". | Ollayorbek |
| Mehroj | `canSeePhone`, docs and copy, the showcase seed, and the production data script. | Abdurauf |

**Order:**
1. The foundation PR goes first; everyone else stacks on it.
2. Merge the foundation (its migration triggers the pre-migration backup), then the rest.
3. Run the production data step, then check every kind of user on the live site.

## Must-have tests

- **Unit:** every organization rule, the guards, and the backfill (a db test on a small fixture).
- **e2e:**
  - The organizer of A gets a 404 on B's event pages **and** B's actions.
  - A judge sees only assigned events, gets a 404 on a team in an unassigned event, and `saveScores` on it is refused.
  - A judge in two organizations sees both organizations' assigned events.
  - A participant registers for two organizations' events and becomes a member of both.
  - An assigned judge can't register for that event.
  - An organizer of A who judges for B sees both areas.
  - The organizer of A sees only A's members' phones.
  - The admin creates an organization and its organizer, who logs in to an empty "<Org> events".

## Interim note (not done)

The cross-organizer access by URL (any organizer can manage any event) and the global phone visibility are the parts with security weight. If organizations stay deferred for long, consider a small interim fix: require `createdById === user.id` in a shared `requireOwnedEvent(eventId)` on every organizer page and action, and limit organizer phone visibility to registrants of their own events.
