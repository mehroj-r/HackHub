# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who runs a hackathon: clubs, companies, communities and universities. University events in Tashkent are the first use case. Each event has three roles:

- **Participants** register, build a profile, join an event, form or join a team with an invite code, and submit a project (title, description, repository link). They are mostly students, often on a phone.
- **Organizers** create events, set judging criteria and weights, open and close registration and submissions, see participants and teams, and publish the ranking. They usually work on a desktop.
- **Judges** score every submitted team against the event's criteria.

## Product Purpose

HackHub runs a whole hackathon in one app, so organizers no longer stitch it together from forms, group chats and spreadsheets. Success means an organizer sets up an event quickly, participants find a team and submit without help, judges score every team, and everyone trusts the published ranking.

## Positioning

- **One place for the whole event:** register, form teams, submit, judge and rank.
- **Fair, transparent judging:** organizers set weighted criteria (whole-percent weights totalling 100), every judge scores every team, and the ranking is computed from those scores.
- **Built for local campuses:** made with Uzbek universities and student communities in mind.
- **Fast for organizers:** an event is set up and running in minutes.

## Operating Context

The event runs in phases. The organizer opens registration, participants register and form teams, submissions open, teams submit, submissions close, judges score, and the organizer publishes results. Organizers manage roles: they can make a participant a judge. Events can have a logo (square) and a header image (wide). Production runs at https://hackhub.mekhroj.uz.

## Capabilities and Constraints

- **Stack:** Next.js 16 (App Router), React 19, Tailwind 4 with shadcn/ui, Prisma with PostgreSQL, and Auth.js using email and password.
- **Interface:** the app UI is currently dark-only.
- **Roles:** three, Participant, Judge and Organizer, each with separate permissions.
- **Out of scope:** matchmaking, judge assignment and team roles.

## Brand Commitments

- The name is **HackHub** and is fixed.
- Everything visual is open to change: icon, colour and type. The current purple theme is to be replaced with something unique and bold.

## Evidence on Hand

- The product docs are in `docs/` (01–08), with the UI spec in `docs/08-ui-spec.md`.
- There are no testimonials, user counts or partner logos. Don't invent any.

## Product Principles

- One flow from registration to results. Nothing should send people back to spreadsheets.
- Judging must be visibly fair: the rules are explicit, the weights add up, and the ranking can be explained.
- Participants on a phone come first; organizers get speed and clarity on a desktop.
- The app should work for any organizer without losing its local campus roots.
