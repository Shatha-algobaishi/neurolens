import type { ConditionId, ConditionIndicator, ConditionLevel, DomainScores, EngineInput } from "./types";
import { average, metricScore, scaleWellbeingScore } from "./signals";

const CONDITION_ORDER: ConditionId[] = ["adhd", "asd", "dyslexia", "dyscalculia", "anxiety", "depression", "mci"];

export { CONDITION_ORDER };

function levelFor(score: number): ConditionLevel {
  if (score >= 72) return "typical";
  if (score >= 50) return "notable";
  return "refer";
}

export function computeConditionIndicators(input: EngineInput, domains: DomainScores): ConditionIndicator[] {
  const { gameResults: g, scaleAnswers, ageGroup } = input;
  const m = (gameId: Parameters<typeof metricScore>[2], key: string) => metricScore(g, ageGroup, gameId, key);

  // faceFocus's engagementScore already flows into domains.attention/socialCognition
  // via scoring.ts, so ADHD and ASD automatically pick up the webcam signal here.
  const adhdScore = average([domains.attention, domains.impulseControl, domains.processingSpeed]);

  const asdScore = average([domains.socialCognition, domains.flexibility], domains.socialCognition);

  const dyslexiaScore = domains.language;

  const dyscalculiaScore = domains.numeracy;

  const anxietyScore = average([scaleWellbeingScore(scaleAnswers, "gad7mini"), m("dotProbe", "threatBiasMs")]);

  const depressionScore = average([
    scaleWellbeingScore(scaleAnswers, "phq9mini"),
    m("rewardSensitivity", "rewardLearningSlope"),
  ]);

  const mciScore = average([domains.executiveFunction, domains.workingMemory, domains.processingSpeed]);

  const scores: Record<ConditionId, number> = {
    adhd: adhdScore,
    asd: asdScore,
    dyslexia: dyslexiaScore,
    dyscalculia: dyscalculiaScore,
    anxiety: anxietyScore,
    depression: depressionScore,
    mci: mciScore,
  };

  return CONDITION_ORDER.map((id) => ({ id, score: scores[id], level: levelFor(scores[id]) }));
}
