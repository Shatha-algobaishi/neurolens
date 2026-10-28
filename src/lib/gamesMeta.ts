import { Star, SmilePlus, Type, Hash, Gem, Palette, Hand, Crosshair, Gift, Route, Fingerprint, BookOpen, Calculator, Mic, Eye } from "lucide-react";
import type { GameId } from "../engine/types";

export interface GameMeta {
  id: GameId;
  path: string;
  icon: typeof Star;
  gradient: string;
  ageGroup: "child" | "adult";
  experimental?: boolean;
}

// Shared games are available to both age groups so every condition
// (including dyslexia, dyscalculia and ASD) has real test coverage
// regardless of which age group a profile picks — norms stay age-banded.
const SHARED_GAMES: GameMeta[] = [
  { id: "quickMath", path: "/games/quick-math", icon: Calculator, gradient: "from-emerald-400 to-teal-500", ageGroup: "child" },
  { id: "voiceEcho", path: "/games/voice-echo", icon: Mic, gradient: "from-fuchsia-400 to-purple-500", ageGroup: "child", experimental: true },
  { id: "faceFocus", path: "/games/face-focus", icon: Eye, gradient: "from-cyan-400 to-blue-500", ageGroup: "child", experimental: true },
];

export const CHILD_GAMES: GameMeta[] = [
  { id: "starCatcher", path: "/games/star-catcher", icon: Star, gradient: "from-yellow-400 to-orange-500", ageGroup: "child" },
  { id: "emotionFriends", path: "/games/emotion-friends", icon: SmilePlus, gradient: "from-pink-400 to-rose-500", ageGroup: "child" },
  { id: "letterRace", path: "/games/letter-race", icon: Type, gradient: "from-blue-400 to-cyan-500", ageGroup: "child" },
  { id: "numberWorld", path: "/games/number-world", icon: Hash, gradient: "from-emerald-400 to-teal-500", ageGroup: "child" },
  { id: "treasureMemory", path: "/games/treasure-memory", icon: Gem, gradient: "from-violet-400 to-purple-500", ageGroup: "child" },
  { id: "colorSwitch", path: "/games/color-switch", icon: Palette, gradient: "from-fuchsia-400 to-pink-500", ageGroup: "child" },
  ...SHARED_GAMES,
];

export const ADULT_GAMES: GameMeta[] = [
  { id: "goNoGo", path: "/games/go-no-go", icon: Hand, gradient: "from-primary to-secondary", ageGroup: "adult" },
  { id: "letterRace", path: "/games/letter-race", icon: Type, gradient: "from-blue-400 to-cyan-500", ageGroup: "adult" },
  { id: "numberWorld", path: "/games/number-world", icon: Hash, gradient: "from-emerald-400 to-teal-500", ageGroup: "adult" },
  { id: "emotionFriends", path: "/games/emotion-friends", icon: SmilePlus, gradient: "from-pink-400 to-rose-500", ageGroup: "adult" },
  { id: "dotProbe", path: "/games/dot-probe", icon: Crosshair, gradient: "from-secondary to-accent", ageGroup: "adult" },
  { id: "rewardSensitivity", path: "/games/reward-sensitivity", icon: Gift, gradient: "from-amber-400 to-orange-500", ageGroup: "adult" },
  { id: "trailMaking", path: "/games/trail-making", icon: Route, gradient: "from-primary to-accent", ageGroup: "adult" },
  { id: "fingerTapping", path: "/games/finger-tapping", icon: Fingerprint, gradient: "from-secondary to-primary", ageGroup: "adult" },
  { id: "delayedRecall", path: "/games/delayed-recall", icon: BookOpen, gradient: "from-accent to-secondary", ageGroup: "adult" },
  ...SHARED_GAMES.map((g) => ({ ...g, ageGroup: "adult" as const })),
];

export function gamesFor(ageGroup: "child" | "adult") {
  return ageGroup === "child" ? CHILD_GAMES : ADULT_GAMES;
}
