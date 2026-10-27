import { CountUp } from "@/components/feedback/count-up";

// A team's total on the scoreboard: 0–100 with one decimal, big and tabular in
// Geist Mono so the column reads as a column of figures. It counts up once on
// first view (CountUp renders the final value at once under reduced motion).

export function RankingTotal({ value }: { value: number }) {
  return (
    <span className="inline-flex items-baseline justify-end gap-1 whitespace-nowrap">
      <span className="font-mono text-3xl font-semibold tracking-[-0.04em] tabular-nums">
        <CountUp value={value} decimals={1} />
      </span>
      <span className="text-sm text-muted-foreground">/ 100</span>
    </span>
  );
}
