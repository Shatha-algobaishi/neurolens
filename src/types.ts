import type { AgeGroup, ConditionIndicator, DomainScores, GameResult, ScaleAnswer } from "./engine/types";

export type Locale = "ar" | "en";
export type ThemeMode = "dark" | "light";

export interface Profile {
  name: string;
  ageGroup: AgeGroup;
  avatarId: string;
  createdAt: string;
}

export interface AIReport {
  narrative: string;
  generatedAt: string;
  source: "claude" | "local";
}

export interface SessionRecord {
  id: string;
  date: string;
  ageGroup: AgeGroup;
  domainScores: DomainScores;
  conditions: ConditionIndicator[];
  report: AIReport | null;
}

export type { AgeGroup, ConditionIndicator, DomainScores, GameResult, ScaleAnswer };
