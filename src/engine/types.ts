export type AgeGroup = "child" | "adult";

export type Domain =
  | "attention"
  | "workingMemory"
  | "processingSpeed"
  | "executiveFunction"
  | "flexibility"
  | "impulseControl"
  | "socialCognition"
  | "language"
  | "numeracy"
  | "emotionalWellbeing";

export type DomainScores = Record<Domain, number>;

export type ConditionId =
  | "adhd"
  | "asd"
  | "dyslexia"
  | "dyscalculia"
  | "anxiety"
  | "depression"
  | "mci";

export type ConditionLevel = "typical" | "notable" | "refer";

export interface ConditionIndicator {
  id: ConditionId;
  level: ConditionLevel;
  score: number; // 0-100, higher = fewer indicators
}

export type ChildGameId =
  | "starCatcher"
  | "emotionFriends"
  | "letterRace"
  | "numberWorld"
  | "treasureMemory"
  | "colorSwitch";

export type AdultGameId =
  | "goNoGo"
  | "dotProbe"
  | "rewardSensitivity"
  | "trailMaking"
  | "fingerTapping"
  | "delayedRecall";

/** Games available to both age groups (norms are still age-banded). */
export type SharedGameId = "quickMath" | "voiceEcho" | "faceFocus";

export type GameId = ChildGameId | AdultGameId | SharedGameId;

export interface GameMetrics {
  avgReactionMs?: number;
  rtVariability?: number;
  accuracy?: number;
  omissionErrors?: number;
  commissionErrors?: number;
  [key: string]: number | undefined;
}

export interface GameResult {
  gameId: GameId;
  metrics: GameMetrics;
  completedAt: string;
}

export interface ScaleAnswer {
  scaleId: "gad7mini" | "phq9mini";
  questionId: string;
  value: number; // 0-3
}

export interface EngineInput {
  ageGroup: AgeGroup;
  gameResults: GameResult[];
  scaleAnswers: ScaleAnswer[];
}

export interface EngineOutput {
  domainScores: DomainScores;
  conditions: ConditionIndicator[];
}
