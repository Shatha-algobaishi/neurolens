import type { GameResult, Profile, ScaleAnswer } from "../types";

export function buildDemoProfile(locale: "ar" | "en"): Profile {
  return {
    name: locale === "ar" ? "سارة" : "Sarah",
    ageGroup: "adult",
    avatarId: "fox",
    createdAt: new Date().toISOString(),
  };
}

export function buildDemoGameResults(): GameResult[] {
  const now = new Date().toISOString();
  return [
    { gameId: "goNoGo", completedAt: now, metrics: { avgReactionMs: 340, rtVariability: 70, accuracy: 91, omissionErrors: 1, commissionErrors: 2 } },
    { gameId: "dotProbe", completedAt: now, metrics: { accuracy: 88, threatBiasMs: 55 } },
    { gameId: "rewardSensitivity", completedAt: now, metrics: { rewardLearningSlope: 0.28 } },
    { gameId: "trailMaking", completedAt: now, metrics: { trailTimeMs: 24000 } },
    { gameId: "fingerTapping", completedAt: now, metrics: { tapVariability: 28 } },
    { gameId: "delayedRecall", completedAt: now, metrics: { recallAccuracy: 75 } },
  ];
}

export function buildDemoScaleAnswers(): ScaleAnswer[] {
  return [
    { scaleId: "gad7mini", questionId: "q1", value: 1 },
    { scaleId: "gad7mini", questionId: "q2", value: 1 },
    { scaleId: "gad7mini", questionId: "q3", value: 0 },
    { scaleId: "gad7mini", questionId: "q4", value: 0 },
    { scaleId: "phq9mini", questionId: "q1", value: 1 },
    { scaleId: "phq9mini", questionId: "q2", value: 0 },
    { scaleId: "phq9mini", questionId: "q3", value: 1 },
    { scaleId: "phq9mini", questionId: "q4", value: 1 },
  ];
}
