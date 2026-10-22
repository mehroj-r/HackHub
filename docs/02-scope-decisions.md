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
| Edit a submission until the deadline | 6 | — | Indifferent: happy either way | — | — | **Removed**. One submission per team |

### Items brought back

| Item | Priority | Decision |
|---|---|---|
| Team member roles assignment | 7 | It was removed with no reason recorded. Stakeholders are "not happy" without it, so it came back as a **Could have** |

### Consequences of the cuts

- **Manual score review.** Because the "not yet scored" view was cut, the organizer must check that every
  team has been scored before publishing the ranking. This step is part of the ranking feature (O5).
- **Teams form on their own.** Participants find teammates outside the platform, then one of them creates the team
  and the others join it.

## Product rules

These rules were decided while planning and are binding for implementation:

| Area | Rule |
|---|---|
| Criteria weights | Weights are percentages. They must total exactly 100% before the criteria can be saved. Criteria are locked once scoring has started |
| Scoring | A judge can score only the teams assigned to them. Each score must be within the criterion's range. Scores can be edited until the results are published |
| Ranking | Teams are ranked by weighted total score. **Tie-break:** compare scores on the highest-weight criterion, then on the next highest, and so on |
| Publishing | The ranking is hidden until the organizer publishes it, which happens after the manual review |
| Comments | Only judges can comment. Comments are visible to the team and to organizers. Judges can edit or delete their own comments |
| Judge role | The organizer assigns the Judge role. Every user has exactly one role |
| Teams | A participant can be on only one team per event, and only participants registered for the event can join |
| Submissions | One submission per team per event. Submitting is blocked while submissions are closed |
| Permissions | Every permission is enforced on the server, not only hidden in the interface |

## Open questions

| Question | Where it's decided |
|---|---|
| The score range for each criterion (for example 0–10) | Assign points against criteria |
| How many judges score each team when auto-assigning | Auto-assign judges to teams |
| Whether the charter's "review registrations" needs an approve/reject step, or just the participant list (O3) | Organizer side |
