export interface RankingFactors {
  criticalGapReduction: number;
  gapReduction: number;
  historyAffinity: number;
  preferenceMatch: number;
  interestMatch: number;
  effortFit: number;
}
export type RankingWeights = Readonly<RankingFactors>;
export interface RecommendationPolicy {
  version: string;
  limit: 1 | 2 | 3;
  historyWindowDays: number;
  historyWeights: Readonly<{ completed: number; noShow: number; dropped: number; declined: number }>;
  weights: RankingWeights;
  score: (factors: Readonly<RankingFactors>, weights: RankingWeights) => number;
}

export function weightedScore(factors: Readonly<RankingFactors>, weights: RankingWeights): number {
  return (Object.keys(weights) as (keyof RankingFactors)[]).reduce((sum, key) => sum + factors[key] * weights[key], 0);
}

export const defaultRecommendationPolicy: RecommendationPolicy = {
  version: "recommendations-v1",
  limit: 3,
  historyWindowDays: 365,
  historyWeights: { completed: 1, noShow: -1, dropped: -0.5, declined: -0.25 },
  weights: { criticalGapReduction: 5, gapReduction: 2, historyAffinity: 1, preferenceMatch: 1, interestMatch: 1, effortFit: 0.5 },
  score: weightedScore,
};
