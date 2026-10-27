import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { OpenEvents, OpenEventsSkeleton } from "@/components/landing/open-events";
import { SampleScoreboard } from "@/components/landing/sample-scoreboard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/dal";
import { ROLE_HOME } from "@/lib/auth/permissions";

// docs/08 > "/ Landing", redesigned as the demo-day big screen (redesign plan >
// Landing): a sample event's published ranking as the hero, the two ways in
// ("Run a hackathon", "Join one"), then the real open events, then what each
// role does and how a hackathon runs. A signed-in user goes to their role home.

const ROLES = [
  {
    title: "Participants",
    text: "Join an event, build your profile, team up and submit your project.",
  },
  {
    title: "Judges",
    text: "Score every submitted team against the same published criteria.",
  },
  {
    title: "Organizers",
    text: "Set up the event, open and close registration, and publish the ranking.",
  },
];

const STEPS = ["Register", "Form a team", "Submit", "Get judged", "See the ranking"];

async function RedirectSignedIn() {
  await connection();
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role]);
  return null;
}

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectSignedIn />
      </Suspense>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20">
        <section aria-labelledby="hero-heading" className="pt-10 pb-12 sm:pt-16 sm:pb-16">
          <h1
            id="hero-heading"
            className="max-w-3xl text-[clamp(2.25rem,1.6rem+2.6vw,3.5rem)] leading-[1.05] font-bold tracking-[-0.025em] text-balance"
          >
            Run a hackathon from first sign-up to the final ranking.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            HackHub handles registration, teams, project submissions, judging and
            the results board, in one place.
          </p>

          <SampleScoreboard className="mt-8 sm:mt-10" />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/register">Run a hackathon</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <Link href="/events">Join one</Link>
            </Button>
          </div>
        </section>

        <section aria-labelledby="open-heading" className="py-10">
          <h2 id="open-heading" className="text-section-title">
            Open for registration
          </h2>
          <Suspense fallback={<OpenEventsSkeleton />}>
            <OpenEvents />
          </Suspense>
        </section>

        <section
          aria-labelledby="how-heading"
          className="grid gap-10 border-t py-12 md:grid-cols-[1fr_1.4fr] md:gap-16"
        >
          <div>
            <h2 id="how-heading" className="text-section-title">
              How a hackathon runs on HackHub
            </h2>
            <ol className="mt-5 flex flex-col gap-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="font-mono text-small text-primary/70 tabular-nums"
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <ul className="flex flex-col divide-y">
            {ROLES.map((role) => (
              <li key={role.title} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold">{role.title}</h3>
                <p className="text-pretty text-muted-foreground">{role.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
