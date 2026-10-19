# 5. User guide

This guide describes how each role uses HackHub. It follows the agreed requirements and product rules.
Screenshots get added once the interface is built.

## Getting started (everyone)

1. **Register** with your email and a password. You'll get an error if the email is already registered.
2. **Log in** with the same email and password. If you get it wrong, HackHub only tells you that the login failed, not which part was wrong.
3. **Complete your profile.** Name and faculty are required. Add your skills, and optionally a bio and contact links.
4. Everyone starts as a **participant**. Organizers give the **judge** role to judges.

HackHub works on both phone and desktop browsers.

---

## Participant

### Join an event
1. Open **Events** to see the events that are open for registration, with their dates and description.
2. Open an event and press **Register**. You can register for each event only once.
   If registration is closed, the button is disabled.
3. Your registered events appear under **My events**.

### Form a team
Teams form on their own. Agree on your team with your teammates first, then:
1. One person creates the team inside the event and becomes its first member.
2. The others **join** that team.
3. You can be on only **one team per event**. You can leave a team, for example to join a different one.
4. The team page shows all of its members (and their team roles, if they're used).

### Follow the schedule
The event page shows the **schedule** and the **challenge brief** published by the organizer, with times in your timezone.

### Submit your project
1. While submissions are open, open your team page and choose **Submit project**.
2. Fill in the **title**, the **description** and the **repository link**. All three are required, and the link must be a valid URL.
3. Each team submits **once**. Check the details before you submit.

### See feedback and results
- Judges' comments on your team appear on your team page.
- The **final ranking** appears once the organizer publishes it.

---

## Judge

### Your assigned teams
After you log in, your dashboard lists **only the teams assigned to you**. Open a team to see its submitted project.

### Score a team
1. Open the team and choose **Score**.
2. Enter a score for **each published criterion**, within its allowed range.
3. Save. You can change your scores until the results are published.

### Leave a comment
Write a short comment for each team. Only the team and the organizers can see it. You can edit or delete your own comments.

---

## Organizer

### Set up an event
1. **Create the event**: name, start and end dates (the end can't be before the start), and description.
2. **Add the schedule and challenge brief.** They're shown on the event page.
3. **Set the judging criteria.** Give each criterion a name and a weight. The weights must total **exactly 100%**,
   or you can't save them. Once scoring starts, the criteria are locked.

### Run the event
1. **Open registration** when participants should start signing up, and close it when you're done.
2. **See all participants and teams**, including which teams have submitted a project.
3. **Give the judge role** to your judges, then run **Auto-assign judges**. Each judge gets a balanced set of teams,
   and you can see every assignment. If teams or judges change, run it again.
4. **Open submissions** for the build phase, and close them at the deadline.

### Publish the results
1. Open the **Ranking**. Teams are ranked by weighted total score. Ties are broken by the highest-weight criterion.
2. **Before publishing, check that every team has been scored by its judges.** HackHub has no automatic tracker for this.
3. **Publish.** The ranking becomes visible to everyone, and scores can no longer be changed.
