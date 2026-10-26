// The ranking as a pure function: docs/03 > Ranking calculation, docs/07 >
// lib/domain, Decision 10. No Prisma and no Next.js imports, so it runs in
// Vitest in milliseconds; lib/queries/ranking.ts loads the rows and calls it.
//
// 1. Per criterion: the average of the judges who scored it, divided by its
//    max score (0–1). A criterion nobody scored counts as 0.
// 2. Total = Σ weight% × normalized, so 0–100.
// 3. Highest total first. Ties are broken by the highest-weight criterion,
//    then the next. Teams still tied share a rank (1, 2, 2, 4).
// 4. Teams without a submission aren't ranked.

export type RankCriterion = {
  id: string;
  weightPercent: number;
  maxScore: number;
};

export type RankTeam = { id: string; hasSubmission: boolean };

export type RankScore = {
  teamId: string;
  criterionId: string;
  judgeId: string;
  value: number;
};

export type RankedTeam<T extends RankTeam> = {
  team: T;
  rank: number;
  /** 0–100, unrounded. Show it with one decimal place. */
  total: number;
  /** Criterion id → average score ÷ max score, from 0 to 1. */
  normalized: Record<string, number>;
  /** How many judges scored this team on at least one criterion. */
  judgeCount: number;
};

export type Ranking<T extends RankTeam> = {
  ranked: RankedTeam<T>[];
  /** Teams without a submission, in the order they were given. */
  unranked: T[];
};

// Totals and normalized scores are compared at 6 decimals, so two values that
// are equal on paper but differ by floating-point noise count as a tie.
const PRECISION = 1e6;
const comparable = (n: number) => Math.round(n * PRECISION);

export function rankTeams<T extends RankTeam>({
  criteria,
  teams,
  scores,
}: {
  criteria: RankCriterion[];
  teams: T[];
  scores: RankScore[];
}): Ranking<T> {
  const ranked = teams.filter((t) => t.hasSubmission);
  const unranked = teams.filter((t) => !t.hasSubmission);

  // teamId → criterionId → { sum, count }, ignoring scores for teams or
  // criteria outside this ranking.
  const criterionIds = new Set(criteria.map((c) => c.id));
  const rankedIds = new Set(ranked.map((t) => t.id));
  const sums = new Map<string, Map<string, { sum: number; count: number }>>();
  const judges = new Map<string, Set<string>>();
  for (const s of scores) {
    if (!rankedIds.has(s.teamId) || !criterionIds.has(s.criterionId)) continue;
    const byCriterion = sums.get(s.teamId) ?? new Map();
    sums.set(s.teamId, byCriterion);
    const cell = byCriterion.get(s.criterionId) ?? { sum: 0, count: 0 };
    byCriterion.set(s.criterionId, cell);
    cell.sum += s.value;
    cell.count += 1;
    const judgeIds = judges.get(s.teamId) ?? new Set();
    judges.set(s.teamId, judgeIds);
    judgeIds.add(s.judgeId);
  }

  const rows = ranked.map((team) => {
    const normalized: Record<string, number> = {};
    let total = 0;
    for (const c of criteria) {
      const cell = sums.get(team.id)?.get(c.id);
      normalized[c.id] = cell ? cell.sum / cell.count / c.maxScore : 0;
      total += c.weightPercent * normalized[c.id];
    }
    return {
      team,
      total,
      normalized,
      judgeCount: judges.get(team.id)?.size ?? 0,
    };
  });

  // Highest weight first; equal weights keep the organizer's order.
  const tieBreak = criteria
    .map((c, index) => ({ c, index }))
    .sort((a, b) => b.c.weightPercent - a.c.weightPercent || a.index - b.index)
    .map(({ c }) => c.id);

  const compare = (a: (typeof rows)[number], b: (typeof rows)[number]) => {
    const byTotal = comparable(b.total) - comparable(a.total);
    if (byTotal !== 0) return byTotal;
    for (const id of tieBreak) {
      const byCriterion =
        comparable(b.normalized[id]) - comparable(a.normalized[id]);
      if (byCriterion !== 0) return byCriterion;
    }
    return 0;
  };

  // Array.prototype.sort is stable, so fully tied teams keep the input order.
  rows.sort(compare);

  let rank = 0;
  return {
    ranked: rows.map((row, i) => {
      if (i === 0 || compare(rows[i - 1], row) !== 0) rank = i + 1;
      return { ...row, rank };
    }),
    unranked,
  };
}
