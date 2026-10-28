import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIReport, DomainScores, GameResult, Profile, ScaleAnswer, SessionRecord } from "../../types";
import type { ConditionIndicator } from "../../engine/types";

interface AppState {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  profile: Profile | null;
  setProfile: (p: Profile) => void;

  soundMuted: boolean;
  toggleSound: () => void;

  gameResults: GameResult[];
  addGameResult: (r: GameResult) => void;
  resetGameResults: () => void;

  scaleAnswers: ScaleAnswer[];
  setScaleAnswer: (a: ScaleAnswer) => void;
  resetScaleAnswers: () => void;

  currentDomainScores: DomainScores | null;
  currentConditions: ConditionIndicator[] | null;
  currentReport: AIReport | null;
  finalizeSession: (domainScores: DomainScores, conditions: ConditionIndicator[], report: AIReport | null) => void;

  history: SessionRecord[];

  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      profile: null,
      setProfile: (profile) => set({ profile }),

      soundMuted: false,
      toggleSound: () => set((s) => ({ soundMuted: !s.soundMuted })),

      gameResults: [],
      addGameResult: (r) =>
        set((s) => ({ gameResults: [...s.gameResults.filter((g) => g.gameId !== r.gameId), r] })),
      resetGameResults: () => set({ gameResults: [] }),

      scaleAnswers: [],
      setScaleAnswer: (a) =>
        set((s) => ({
          scaleAnswers: [
            ...s.scaleAnswers.filter((x) => !(x.scaleId === a.scaleId && x.questionId === a.questionId)),
            a,
          ],
        })),
      resetScaleAnswers: () => set({ scaleAnswers: [] }),

      currentDomainScores: null,
      currentConditions: null,
      currentReport: null,
      finalizeSession: (domainScores, conditions, report) =>
        set((s) => ({
          currentDomainScores: domainScores,
          currentConditions: conditions,
          currentReport: report,
          history: [
            {
              id: `session-${Date.now()}`,
              date: new Date().toISOString(),
              ageGroup: s.profile?.ageGroup ?? "adult",
              domainScores,
              conditions,
              report,
            },
            ...s.history,
          ].slice(0, 20),
        })),

      history: [],

      resetAll: () =>
        set({
          profile: null,
          gameResults: [],
          scaleAnswers: [],
          currentDomainScores: null,
          currentConditions: null,
          currentReport: null,
          history: [],
        }),
    }),
    {
      name: "neurolens-v2-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
