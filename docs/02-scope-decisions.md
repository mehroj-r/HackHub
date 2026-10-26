# 2. Scope decisions

## Requirements scrubbing

Every requirement was reviewed from four stakeholder viewpoints. Mehroj spoke for the customer, Xurliman for the
end user, Abdurauf for operations staff, and Ollayorbek for the developer. Items that no viewpoint needed were cut.

### Cut items

| Item | Priority | Customer | End user | Operations | Developer | Decision |
|---|---|---|---|---|---|---|
| List of participants looking for a team | 3 | Matchmaking isn't something the platform needs to do. Teams can organize themselves before they register | I'd rather ask around directly than browse a formal list | No support process depends on it | Extra profile, browse and filter UI for a feature nobody flagged as blocking | **Cut** |
| List of teams with no points assigned | 2 | As long as the ranking is complete before I publish it, I don't need a live tracker | I can check my own assigned list | A missing score can be caught in a manual review before publishing | Another filtered view on top of scoring, for a check that can be done by hand once | **Cut** |
| Assign judges to teams (manual) | 1 | I'd rather the system assigned judges than do it by hand for every team | It doesn't matter how, as long as I get a fair set of teams | Manual assignment is one more setup step to babysit | Auto-assign needs less UI than a manual assignment screen | **Replaced** with auto-assign |
| Edit a submission until the deadline | 6 | — | Indifferent: happy either way | — | — | **Removed**, then brought back on 26 Oct (see below) |

### Items brought back

| Item | Priority | Decision |
|---|---|---|
| Team member roles assignment | 7 | It was removed with no reason recorded. Stakeholders are "not happy" without it, so it came back as a **Could have** |
| Edit a submission while submissions are open | 6 | Brought back on 26 Oct. Still one submission per team, but any member can update it until the organizer closes submissions, so a wrong repository link can be fixed. The route map and UI spec already had "Save changes" |

### Consequences of the cuts

- **Manual score review.** Because the "not yet scored" view was cut, the organizer must check that every
  team has been scored before publishing the ranking. This step is part of the ranking feature (O5).
- **Teams form on their own.** Participants find teammates outside the platform, then one of them creates the team
  and the others join it.

## Product rules

These rules are binding for implementation. They include the 12 release decisions from
[System design](07-system-design.md#decisions-for-the-oct-30-release) and the questions raised while writing the specs,
all **confirmed on 26 Oct 2026** for the Oct 28 release. Decision numbers are in brackets.

| Area | Rule |
|---|---|
| Accounts | Password at least 8 characters. Emails are stored lowercased. The first organizer is created by the seed from `SEED_ORGANIZER_EMAIL` / `SEED_ORGANIZER_PASSWORD` (7, 8) |
| Profile | Name and faculty are required (up to 80 characters each). Skills are optional, up to 10 tags of up to 30 characters. Bio up to 500 characters. Up to 3 links. A participant must save name and faculty before registering for an event; new accounts land on `/profile` |
| Profile visibility | Any signed-in user can view any profile, read-only. The email isn't shown on it (12) |
| Events | The end date can't be before the start date; dates have no time of day. Max team size is 1–10 (default 4) and can't go below the largest current team. There is no Draft state: a new event has registration closed and is listed on `/events` once registration opens. Any organizer can manage any event (5) |
| Event listing | `/events` lists only events with registration open. Past events are reached from `/my-events`, `/judge` or a direct link; a past-events list is after the release |
| Teams | A participant can be on only one team per event, and only participants registered for the event can join. Join with the team's 6-character invite code. Team names are unique in the event, 2–40 characters. Nobody joins a team that has submitted. Leaving is allowed until the team submits; when the last member leaves, the team is deleted (4, 9) |
| Submissions | One submission per team per event. Any team member can submit, and can update it while submissions are open. Submitting is refused while submissions are closed |
| Criteria weights | Whole percents from 1 to 100 that total exactly 100%, checked on the server. Each criterion has a max score (whole number, at least 1, default 10). Criteria lock once any score exists for the event (6) |
| Scoring | Every judge scores every submitted team of every event; there's no assignment step. Scoring opens when the event's submissions close and scores can be edited until results are published. Scores are whole numbers from 0 to the criterion's max. A judge can save with some criteria empty ("In progress"); "Scored" means every criterion has a score. An event is "in judging" when submissions are closed, results aren't published, and it has at least one submission (1, 2) |
| Ranking | Per criterion, the judges' scores are averaged and divided by the max score; a criterion nobody scored counts as 0. The total is the weighted sum, 0–100, shown with one decimal. **Tie-break:** the highest-weight criterion, then the next highest, and so on; teams still tied share a rank (1, 1, 3). Teams without a submission aren't ranked; the organizer preview lists them separately (10) |
| Publishing | Part of "Open and close registration and submissions". Publishing needs submissions closed and criteria set, asks for confirmation and can't be undone. Afterwards every switch is disabled and scores are locked. Submissions can't reopen once any score exists, and closing submissions asks for confirmation. The ranking is hidden until published and then shows rank, team, members and total only, never individual judges' scores (3, 10) |
| Comments | After the release. When built: only judges can comment; comments are visible to the team and to organizers; judges can edit or delete their own comments |
| Judge role | The organizer assigns the Judge role. Every user has exactly one role. Role changes are participant ↔ judge only, and a participant who's on a team in any event can't become a judge. Nobody changes their own role (11) |
| Permissions | Every permission is enforced on the server, not only hidden in the interface. Authorization re-reads the role from the database on every request, so a role change applies without logging in again (8) |
| Display | All times are shown in GMT+5 (Tashkent) as `26 Oct 2026, 14:05`. A signed-in user opening `/` goes to their role home: `/my-events`, `/judge` or `/organizer` |

## Open questions

No release card depends on an open question. Resolved on 26 Oct:

| Question | Answer |
|---|---|
| The score range for each criterion (for example 0–10) | Set per criterion by the organizer: 0 to max score, max score at least 1, default 10 (Decision 6) |
| Whether the charter's "review registrations" needs an approve/reject step, or just the participant list (O3) | Just the participant list. No approval step |

Still open, for cards after the release:

| Question | Where it's decided |
|---|---|
| How many judges score each team when auto-assigning | Auto-assign judges to teams |
