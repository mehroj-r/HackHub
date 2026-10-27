// Where a participant stands in an event (redesign > Participant progress):
// Profile · Registered · Team · Submitted, for <ProgressRail> on every page
// inside an event and the event page's "your status". Pure: no Prisma or
// Next.js imports. The event's own phase is lib/domain/event-phase.ts.

export type ProgressStepId = "profile" | "registered" | "team" | "submitted";

export type ProgressStep = {
  id: ProgressStepId;
  label: string;
  done: boolean;
  current: boolean;
  href: string;
};

export type ParticipantFlags = {
  profileComplete: boolean;
  registered: boolean;
  onTeam: boolean;
  submitted: boolean;
};

/**
 * Profile · Registered · Team · Submitted. Done steps come from the data; the
 * current step is the first one not done. Each links to where it's completed.
 */
export function participantProgress(
  eventId: string,
  state: ParticipantFlags,
): ProgressStep[] {
  const base = `/events/${eventId}`;
  const steps: Omit<ProgressStep, "current">[] = [
    { id: "profile", label: "Profile", done: state.profileComplete, href: "/profile" },
    { id: "registered", label: "Registered", done: state.registered, href: base },
    { id: "team", label: "Team", done: state.onTeam, href: `${base}/team` },
    {
      id: "submitted",
      label: "Submitted",
      done: state.submitted,
      href: state.onTeam ? `${base}/team/submit` : `${base}/team`,
    },
  ];
  const firstOpen = steps.findIndex((s) => !s.done);
  return steps.map((s, i) => ({ ...s, current: i === firstOpen }));
}

/** True once every step is done: the rail then folds to "All set". */
export function allDone(steps: ProgressStep[]) {
  return steps.every((s) => s.done);
}
