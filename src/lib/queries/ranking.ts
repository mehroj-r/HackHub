import "server-only";

import {
  rankTeams,
  type RankCriterion,
  type RankedTeam,
  type RankScore,
} from "@/lib/domain/ranking";
import { prisma } from "@/lib/prisma";

// Loads an event's ranking inputs and ranks them (docs/07 > lib/queries). The
// organizer preview and the public event page both read through here, so the
// two never disagree. Access checks belong to the caller: the public page shows
// the result only once results are published.

export type RankingMember = { userId: string; name: string | null };

export type RankingTeam = {
  id: string;
  name: string;
  hasSubmission: boolean;
  members: RankingMember[];
};

export type RankingCriterion = RankCriterion & { name: string };

export type EventRanking = {
  criteria: RankingCriterion[];
  ranked: RankedTeam<RankingTeam>[];
  /** Teams without a submission, which aren't ranked (Decision 10). */
  unranked: RankingTeam[];
  /** How many scores the event has; 0 means "No scores yet". */
  scoreCount: number;
};

/** The rows getEventRanking() reads, in the shape Prisma returns them. */
export type RankingRows = {
  criteria: RankingCriterion[];
  teams: {
    id: string;
    name: string;
    submission: { id: string } | null;
    members: {
      userId: string;
      user: { profile: { name: string } | null };
    }[];
  }[];
  scores: RankScore[];
};

/** Database rows → plain rankTeams() input. Pure, so it's unit tested. */
export function toRankInput(rows: RankingRows) {
  return {
    criteria: rows.criteria,
    teams: rows.teams.map((team): RankingTeam => ({
      id: team.id,
      name: team.name,
      hasSubmission: team.submission !== null,
      members: team.members.map((m) => ({
        userId: m.userId,
        name: m.user.profile?.name ?? null,
      })),
    })),
    scores: rows.scores,
  };
}

export async function getEventRanking(eventId: string): Promise<EventRanking> {
  const [criteria, teams, scores] = await Promise.all([
    prisma.criterion.findMany({
      where: { eventId },
      select: { id: true, name: true, weightPercent: true, maxScore: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.team.findMany({
      where: { eventId },
      select: {
        id: true,
        name: true,
        submission: { select: { id: true } },
        members: {
          select: {
            userId: true,
            user: { select: { profile: { select: { name: true } } } },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.score.findMany({
      where: { team: { eventId } },
      select: { teamId: true, criterionId: true, judgeId: true, value: true },
    }),
  ]);

  const input = toRankInput({ criteria, teams, scores });
  const { ranked, unranked } = rankTeams(input);
  return { criteria, ranked, unranked, scoreCount: scores.length };
}
