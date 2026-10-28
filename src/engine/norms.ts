import type { AgeGroup } from "./types";

export type Direction = "lowerBetter" | "higherBetter";

export interface MetricNorm {
  good: number;
  poor: number;
  direction: Direction;
}

type NormTable = Record<string, Record<AgeGroup, MetricNorm>>;

/**
 * Hardcoded age-band reference anchors. `good` and `poor` bound the linear
 * normalization curve used by normalizeMetric() — not clinical cutoffs.
 */
export const NORMS: NormTable = {
  avgReactionMs: {
    child: { good: 450, poor: 950, direction: "lowerBetter" },
    adult: { good: 300, poor: 650, direction: "lowerBetter" },
  },
  rtVariability: {
    child: { good: 90, poor: 320, direction: "lowerBetter" },
    adult: { good: 50, poor: 220, direction: "lowerBetter" },
  },
  accuracy: {
    child: { good: 95, poor: 55, direction: "higherBetter" },
    adult: { good: 97, poor: 65, direction: "higherBetter" },
  },
  omissionErrors: {
    child: { good: 0, poor: 9, direction: "lowerBetter" },
    adult: { good: 0, poor: 7, direction: "lowerBetter" },
  },
  commissionErrors: {
    child: { good: 0, poor: 9, direction: "lowerBetter" },
    adult: { good: 0, poor: 7, direction: "lowerBetter" },
  },
  spanReached: {
    child: { good: 7, poor: 2, direction: "higherBetter" },
    adult: { good: 9, poor: 3, direction: "higherBetter" },
  },
  namingSpeedMs: {
    child: { good: 900, poor: 2400, direction: "lowerBetter" },
    adult: { good: 500, poor: 1400, direction: "lowerBetter" },
  },
  phonemeAccuracy: {
    child: { good: 95, poor: 55, direction: "higherBetter" },
    adult: { good: 97, poor: 65, direction: "higherBetter" },
  },
  switchCostMs: {
    child: { good: 150, poor: 900, direction: "lowerBetter" },
    adult: { good: 80, poor: 600, direction: "lowerBetter" },
  },
  socialAccuracy: {
    child: { good: 92, poor: 45, direction: "higherBetter" },
    adult: { good: 95, poor: 55, direction: "higherBetter" },
  },
  threatBiasMs: {
    child: { good: 20, poor: 180, direction: "lowerBetter" },
    adult: { good: 15, poor: 150, direction: "lowerBetter" },
  },
  rewardLearningSlope: {
    child: { good: 0.35, poor: 0.02, direction: "higherBetter" },
    adult: { good: 0.4, poor: 0.02, direction: "higherBetter" },
  },
  trailTimeMs: {
    child: { good: 20000, poor: 75000, direction: "lowerBetter" },
    adult: { good: 15000, poor: 60000, direction: "lowerBetter" },
  },
  tapVariability: {
    child: { good: 25, poor: 110, direction: "lowerBetter" },
    adult: { good: 15, poor: 90, direction: "lowerBetter" },
  },
  recallAccuracy: {
    child: { good: 87.5, poor: 25, direction: "higherBetter" },
    adult: { good: 100, poor: 37.5, direction: "higherBetter" },
  },
  voiceFluency: {
    child: { good: 100, poor: 0, direction: "higherBetter" },
    adult: { good: 100, poor: 0, direction: "higherBetter" },
  },
  engagementScore: {
    child: { good: 100, poor: 0, direction: "higherBetter" },
    adult: { good: 100, poor: 0, direction: "higherBetter" },
  },
};

export function normalizeMetric(key: string, value: number, ageGroup: AgeGroup): number {
  const norm = NORMS[key]?.[ageGroup];
  if (!norm) return 68; // neutral fallback baseline for unmapped metrics
  const { good, poor, direction } = norm;
  const t = direction === "lowerBetter" ? (poor - value) / (poor - good) : (value - poor) / (good - poor);
  return Math.round(Math.min(100, Math.max(0, t * 100)));
}
