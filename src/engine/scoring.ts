import type { Domain, DomainScores, EngineInput } from "./types";
import { average, metricScore, scaleWellbeingScore } from "./signals";

export const DOMAIN_ORDER: Domain[] = [
  "attention",
  "workingMemory",
  "processingSpeed",
  "executiveFunction",
  "flexibility",
  "impulseControl",
  "socialCognition",
  "language",
  "numeracy",
  "emotionalWellbeing",
];

export function computeDomainScores(input: EngineInput): DomainScores {
  const { gameResults: g, scaleAnswers, ageGroup } = input;
  const m = (gameId: Parameters<typeof metricScore>[2], key: string) => metricScore(g, ageGroup, gameId, key);

  const attention = average([
    m("starCatcher", "accuracy"),
    m("starCatcher", "omissionErrors"),
    m("goNoGo", "accuracy"),
    m("goNoGo", "omissionErrors"),
    m("dotProbe", "accuracy"),
    m("faceFocus", "engagementScore"),
  ]);

  const workingMemory = average([m("treasureMemory", "spanReached"), m("delayedRecall", "recallAccuracy")]);

  const processingSpeed = average([
    m("starCatcher", "avgReactionMs"),
    m("goNoGo", "avgReactionMs"),
    m("trailMaking", "trailTimeMs"),
    m("fingerTapping", "tapVariability"),
  ]);

  const executiveFunction = average([m("colorSwitch", "switchCostMs"), m("trailMaking", "trailTimeMs")]);

  const flexibility = average([m("colorSwitch", "switchCostMs"), m("colorSwitch", "accuracy")]);

  const impulseControl = average([m("starCatcher", "commissionErrors"), m("goNoGo", "commissionErrors")]);

  const socialCognition = average([m("emotionFriends", "socialAccuracy"), m("faceFocus", "engagementScore")]);

  const language = average([m("letterRace", "namingSpeedMs"), m("letterRace", "phonemeAccuracy"), m("voiceEcho", "voiceFluency")]);

  const numeracy = average([m("numberWorld", "accuracy"), m("numberWorld", "avgReactionMs"), m("quickMath", "accuracy"), m("quickMath", "avgReactionMs")]);

  const emotionalWellbeing = average([
    m("dotProbe", "threatBiasMs"),
    m("rewardSensitivity", "rewardLearningSlope"),
    scaleWellbeingScore(scaleAnswers, "gad7mini"),
    scaleWellbeingScore(scaleAnswers, "phq9mini"),
  ]);

  return {
    attention,
    workingMemory,
    processingSpeed,
    executiveFunction,
    flexibility,
    impulseControl,
    socialCognition,
    language,
    numeracy,
    emotionalWellbeing,
  };
}
