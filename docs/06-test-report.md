# 6. Test report

> **Status:** template, with every test case listed. Results get filled in as each feature is built and tested.
> The test cases come straight from the **Tasks** checklist of each Trello card, so the report and the board
> stay in step. If a card's tasks change, update its cases here.

## Approach

- **Who tests.** The team has no dedicated QA. Each card is tested by someone **other than the person who built it**.
  Mehroj coordinates testing.
- **When.** A card is tested before it moves to Completed. The whole set of tests is run again before every production deploy.
- **What.** Every task on a card is a check. Lines that started with "Tests:" are split into one case each.
- **Where.** Local environment during development, and production for the post-deploy smoke test
  (see [Setup and deployment](04-setup-and-deployment.md#smoke-test-after-a-deploy)).
- **Results.** `Pass`, `Fail (bug #n)`, `Blocked`, or `Not run`. Each failure gets an entry in the bug log below.

## Summary

| Area | Cases | Pass | Fail | Not run |
|---|---|---|---|---|
| All features | 116 | 0 | 0 | 116 |

Last full run: _not yet run_

## Test cases

### Assign points against criteria (Must have)

| ID | Check | Result |
|---|---|---|
| TC-01 | Scoring form listing each criterion of the event | Not run |
| TC-02 | Enforce score range per criterion | Not run |
| TC-03 | Judge can only score teams assigned to them | Not run |
| TC-04 | Allow editing scores until results are published | Not run |
| TC-05 | Compute weighted total per team | Not run |
| TC-06 | Test: scoring | Not run |
| TC-07 | Test: range | Not run |
| TC-08 | Test: unassigned team rejected | Not run |

### Create a profile (Must have)

| ID | Check | Result |
|---|---|---|
| TC-09 | Profile fields: name, faculty, skills, bio, contact/links | Not run |
| TC-10 | Create and edit profile page | Not run |
| TC-11 | Validate required fields | Not run |
| TC-12 | Show profile to other users (read-only view) | Not run |
| TC-13 | Test: create and update profile | Not run |

### Create a team or join an existing one (Must have)

| ID | Check | Result |
|---|---|---|
| TC-14 | Create team (name) within an event; creator becomes a member | Not run |
| TC-15 | Join an existing team (invite code or join request) | Not run |
| TC-16 | Only registered participants of the event can join | Not run |
| TC-17 | A participant can be in only one team per event | Not run |
| TC-18 | Leave team | Not run |
| TC-19 | Show team members on the team page | Not run |
| TC-20 | Test: create | Not run |
| TC-21 | Test: join | Not run |
| TC-22 | Test: one-team-per-event rule | Not run |

### Create an event with name, dates, description (Must have)

| ID | Check | Result |
|---|---|---|
| TC-23 | Event form: name, start/end dates, description | Not run |
| TC-24 | Validate end date is after start date | Not run |
| TC-25 | Edit event details | Not run |
| TC-26 | Only organizers can create or edit events | Not run |
| TC-27 | Created event appears in the open events list | Not run |
| TC-28 | Test: create | Not run |
| TC-29 | Test: date validation | Not run |
| TC-30 | Test: permission check | Not run |

### Open and close registration and submissions (Must have)

| ID | Check | Result |
|---|---|---|
| TC-31 | Toggle registration open/closed per event | Not run |
| TC-32 | Toggle submissions open/closed per event | Not run |
| TC-33 | Enforce state on the backend (not just hidden buttons) | Not run |
| TC-34 | Show current status to participants | Not run |
| TC-35 | Test: actions blocked when closed | Not run |

### Open events and register for one (Must have)

| ID | Check | Result |
|---|---|---|
| TC-36 | List open events (name, dates, short description) | Not run |
| TC-37 | Event details page | Not run |
| TC-38 | Register button; blocked when registration is closed | Not run |
| TC-39 | Prevent registering twice for the same event | Not run |
| TC-40 | Show the user's registered events | Not run |
| TC-41 | Test: register | Not run |
| TC-42 | Test: duplicate | Not run |
| TC-43 | Test: closed registration | Not run |

### Register with email and password (Must have)

| ID | Check | Result |
|---|---|---|
| TC-44 | Registration form: email, password, confirm password | Not run |
| TC-45 | Validate email format and password strength | Not run |
| TC-46 | Reject duplicate emails with a clear error | Not run |
| TC-47 | Hash passwords before storing (never plain text) | Not run |
| TC-48 | Login and logout with session/token handling | Not run |
| TC-49 | Test: register | Not run |
| TC-50 | Test: duplicate email | Not run |
| TC-51 | Test: wrong password | Not run |

### See all registered participants and teams (Must have)

| ID | Check | Result |
|---|---|---|
| TC-52 | Organizer view: participants list per event | Not run |
| TC-53 | Teams list with their members | Not run |
| TC-54 | Show which teams have submitted a project | Not run |
| TC-55 | Only organizers can access this view | Not run |
| TC-56 | Test: data shown | Not run |
| TC-57 | Test: permission check | Not run |

### Set the judging criteria and their weights (Must have)

| ID | Check | Result |
|---|---|---|
| TC-58 | Add, edit, remove criteria for an event | Not run |
| TC-59 | Set a weight per criterion | Not run |
| TC-60 | Validate weights: they must total exactly 100% before saving | Not run |
| TC-61 | Lock criteria once scoring has started | Not run |
| TC-62 | Test: CRUD criteria | Not run |
| TC-63 | Test: weight validation | Not run |

### Submit a project: repo, description, title (Must have)

| ID | Check | Result |
|---|---|---|
| TC-64 | Submission form: title, description, repository URL | Not run |
| TC-65 | Validate repository URL | Not run |
| TC-66 | One submission per team per event | Not run |
| TC-67 | Blocked when submissions are closed | Not run |
| TC-68 | Submission visible to judges and organizers | Not run |
| TC-69 | Test: submit | Not run |
| TC-70 | Test: validation | Not run |
| TC-71 | Test: closed submissions | Not run |

### Three roles with separate permissions (Must have)

| ID | Check | Result |
|---|---|---|
| TC-72 | Define roles: Participant, Judge, Organizer | Not run |
| TC-73 | Permission matrix: which role can do what | Not run |
| TC-74 | Backend authorization checks on every endpoint | Not run |
| TC-75 | UI shows only actions allowed for the role | Not run |
| TC-76 | Organizer can assign Judge role | Not run |
| TC-77 | Test: each role blocked from others' actions | Not run |

### Auto-assign judges to teams (Should have)

| ID | Check | Result |
|---|---|---|
| TC-78 | Assignment algorithm: spread teams fairly across judges | Not run |
| TC-79 | Avoid assigning the same team to one judge twice | Not run |
| TC-80 | Organizer triggers auto-assign for an event | Not run |
| TC-81 | Show resulting judge-team assignments to the organizer | Not run |
| TC-82 | Re-run when judges or teams change | Not run |
| TC-83 | Test: fair distribution | Not run |
| TC-84 | Test: no duplicates | Not run |

### Leave a comment under projects (Should have)

| ID | Check | Result |
|---|---|---|
| TC-85 | Comment box on the project page | Not run |
| TC-86 | Show comment author, role and time | Not run |
| TC-87 | Edit/delete own comments | Not run |
| TC-88 | Only judges can comment; comments are visible to the team and organizers | Not run |
| TC-89 | Test: add | Not run |
| TC-90 | Test: edit | Not run |
| TC-91 | Test: delete | Not run |
| TC-92 | Test: permission | Not run |

### Log in and see the teams (Should have)

| ID | Check | Result |
|---|---|---|
| TC-93 | Judge dashboard after login | Not run |
| TC-94 | List of teams assigned to the judge | Not run |
| TC-95 | Open a team's project submission from the list | Not run |
| TC-96 | Test: judge sees only assigned teams | Not run |

### See the event schedule and event brief (Should have)

| ID | Check | Result |
|---|---|---|
| TC-97 | Organizer can add schedule items (time, title) and a brief | Not run |
| TC-98 | Schedule and brief shown on the event page | Not run |
| TC-99 | Times displayed in the user's timezone | Not run |
| TC-100 | Test: schedule display | Not run |

### See the final ranking (Should have)

| ID | Check | Result |
|---|---|---|
| TC-101 | Rank teams by weighted total score | Not run |
| TC-102 | Tie-break: compare scores on the highest-weight criterion, then the next highest | Not run |
| TC-103 | Organizer manually reviews that all teams are scored, then publishes | Not run |
| TC-104 | Ranking visible to everyone only after publishing | Not run |
| TC-105 | Test: ranking order | Not run |
| TC-106 | Test: unpublished ranking hidden | Not run |

### Works on both screens: desktop / phone (Should have)

| ID | Check | Result |
|---|---|---|
| TC-107 | Responsive layout for main pages | Not run |
| TC-108 | Mobile navigation menu | Not run |
| TC-109 | Forms and tables usable on small screens | Not run |
| TC-110 | Test on phone and desktop browsers | Not run |

### Team member roles assignment (Could have)

| ID | Check | Result |
|---|---|---|
| TC-111 | Define the list of team roles (for example Developer, Designer, Presenter) | Not run |
| TC-112 | The team creator can assign a role to each member | Not run |
| TC-113 | Each member has at most one team role | Not run |
| TC-114 | Show every member's role on the team page | Not run |
| TC-115 | Test: assign | Not run |
| TC-116 | Test: change and view roles | Not run |

## Bug log

| # | Found in | Description | Severity | Found by | Status |
|---|---|---|---|---|---|
| — | — | _none yet_ | — | — | — |

## Release sign-off

| Release | Date | Regression run | Open bugs | Signed off by |
|---|---|---|---|---|
| Final | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
