import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const areas = [
  {
    title: "Participants",
    description:
      "Register for an event, build a profile, join a team and submit a project.",
  },
  {
    title: "Judges",
    description:
      "Review the teams you are assigned, score them against the criteria and leave comments.",
  },
  {
    title: "Organizers",
    description:
      "Set up the event, publish the schedule and brief, then publish the final ranking.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          Project skeleton
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          HackHub
        </h1>
        <p className="max-w-2xl text-balance text-lg text-muted-foreground">
          A platform that runs a hackathon from registration to the final
          ranking. Feature work starts from here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" disabled>
            Sign in
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a
              href="https://github.com/ollayorbek0833/HackHub"
              target="_blank"
              rel="noreferrer"
            >
              Repository
            </a>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {areas.map((area) => (
          <Card key={area.title}>
            <CardHeader>
              <CardTitle>{area.title}</CardTitle>
              <CardDescription>{area.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Not built yet.</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
