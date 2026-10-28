import type { AgeGroup, GameId, GameResult, ScaleAnswer } from "./types";
import { normalizeMetric } from "./norms";
import { clamp } from "../lib/utils";

const MINI_SCALE_MAX = 12; // 4 questions x max value 3

export function findGame(results: GameResult[], id: GameId) {
  return results.find((r) => r.gameId === id);
}

export function metricScore(
  results: GameResult[],
  ageGroup: AgeGroup,
  gameId: GameId,
  metricKey: string
): number | null {
  const game = findGame(results, gameId);
  const value = game?.metrics[metricKey];
  if (value === undefined) return null;
  return normalizeMetric(metricKey, value, ageGroup);
}

export function average(values: (number | null | undefined)[], fallback = 68): number {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (nums.length === 0) return fallback;
  return clamp(Math.round(nums.reduce((a, b) => a + b, 0) / nums.length));
}

export function scaleWellbeingScore(answers: ScaleAnswer[], scaleId: ScaleAnswer["scaleId"]): number | null {
  const items = answers.filter((a) => a.scaleId === scaleId);
  if (items.length === 0) return null;
  const sum = items.reduce((a, b) => a + b.value, 0);
  return clamp(Math.round(100 - (sum / MINI_SCALE_MAX) * 100));
}
