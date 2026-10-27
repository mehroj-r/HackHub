import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ClipboardCheckIcon,
  GavelIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/dal";
import { ROLE_HOME } from "@/lib/auth/permissions";

// docs/08 > "/ Landing". Everything on the page is static; only the redirect
// for signed-in users reads the session, inside Suspense (Cache Components).

const ROLES: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Participants",
    text: "Join an event, build your profile, team up and submit your project.",
    icon: UsersIcon,
  },
  {
    title: "Judges",
    text: "Score every submitted team against the published criteria.",
    icon: GavelIcon,
  },
  {
    title: "Organizers",
    text: "Set up the event, open and close registration, and publish the ranking.",
    icon: SettingsIcon,
  },
];

const STEPS = [
  { title: "Register", text: "Create an account and add your skills." },
  { title: "Form a team", text: "Start a team or join one with an invite code." },
  { title: "Submit", text: "Send in your project before submissions close." },
  { title: "Get judged", text: "Judges score every team on the same criteria." },
  { title: "See the ranking", text: "The final ranking is published for everyone." },
];

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

      <main className="mx-auto w-full max-w-6xl px-4 pb-20">
        <section className="relative isolate overflow-hidden py-16 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <p className="mb-4 inline-flex items-center rounded-full border border-highlight/40 bg-highlight/10 px-3 py-1 text-sm font-medium text-highlight">
            Hackathons, minus the chaos
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Run a hackathon from first sign-up to{" "}
            <span className="text-highlight">final ranking</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">
            HackHub handles registration, teams, project submissions, judging
            and results, all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/events">Browse events</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
            >
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </section>

        <section aria-labelledby="roles-heading" className="py-8">
          <h2 id="roles-heading" className="text-2xl font-semibold">
            Who it&apos;s for
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {ROLES.map(({ title, text, icon: Icon }) => (
              <li
                key={title}
                className="rounded-2xl border bg-card p-5 text-card-foreground"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="steps-heading" className="py-8">
          <h2 id="steps-heading" className="text-2xl font-semibold">
            How it works
          </h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border bg-card p-5 text-card-foreground"
              >
                <span className="font-mono text-sm font-semibold text-highlight">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardCheckIcon className="size-4 text-success" aria-hidden />
          Free to join. Pick an event and register in a minute.
        </div>
      </main>
    </>
  );
}
