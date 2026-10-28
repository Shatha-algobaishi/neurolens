import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { Chip } from "../../components/ui/Chip";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { sound } from "../../lib/sound";
import { clamp, cn } from "../../lib/utils";

const TOTAL_ROUNDS = 6;
const EMOTIONS: { key: "happy" | "sad" | "angry" | "surprised" | "scared" | "calm"; emoji: string }[] = [
  { key: "happy", emoji: "😄" },
  { key: "sad", emoji: "😢" },
  { key: "angry", emoji: "😠" },
  { key: "surprised", emoji: "😲" },
  { key: "scared", emoji: "😨" },
  { key: "calm", emoji: "😌" },
];

type Phase = "instructions" | "countdown" | "playing" | "complete";
interface Round {
  correct: number;
  options: number[];
}

function buildRound(): Round {
  const shuffled = [...EMOTIONS.keys()].sort(() => Math.random() - 0.5);
  const options = shuffled.slice(0, 4);
  const correct = options[Math.floor(Math.random() * options.length)];
  return { correct, options };
}

function EmotionFriendsContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState({ accuracy: 0, avgReactionMs: 0 });

  const shownAtRef = useRef(0);
  const statsRef = useRef({ correct: 0, reactions: [] as number[] });

  const finishGame = useCallback(() => {
    const { correct, reactions } = statsRef.current;
    const accuracy = clamp((correct / TOTAL_ROUNDS) * 100);
    const avgReactionMs = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 0;
    setResult({ accuracy, avgReactionMs });
    addGameResult({ gameId: "emotionFriends", completedAt: new Date().toISOString(), metrics: { socialAccuracy: accuracy, avgReactionMs } });
    setPhase("complete");
  }, [addGameResult]);

  const loadRound = useCallback((idx: number) => {
    setRound(buildRound());
    setSelected(null);
    setRoundNum(idx);
    shownAtRef.current = Date.now();
  }, []);

  const startGame = () => {
    statsRef.current = { correct: 0, reactions: [] };
    setPhase("countdown");
  };

  const choose = (optionIdx: number) => {
    if (!round || selected !== null) return;
    setSelected(optionIdx);
    statsRef.current.reactions.push(Date.now() - shownAtRef.current);
    if (optionIdx === round.correct) {
      statsRef.current.correct += 1;
      sound.hit();
    } else {
      sound.miss();
    }
    setTimeout(() => {
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) finishGame();
      else loadRound(next);
    }, 750);
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.emotionFriends.name} right={phase === "playing" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<SmilePlus size={34} />}
            name={t.games.emotionFriends.name}
            instructions={t.games.emotionFriends.instructions}
            measures={t.games.emotionFriends.measures}
            demo={
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-5xl">
                😄
              </motion.div>
            }
            onStart={startGame}
          />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => {
              setPhase("playing");
              loadRound(0);
            }}
            goLabel={t.games.emotionFriends.name}
          />
        )}

        {phase === "playing" && round && (
          <motion.div key={roundNum} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-10">
            <div className="flex h-40 w-40 items-center justify-center rounded-full glass-strong text-8xl">{EMOTIONS[round.correct].emoji}</div>
            <div className="grid grid-cols-2 gap-3">
              {round.options.map((optIdx) => {
                const isCorrect = optIdx === round.correct;
                const showState = selected !== null;
                return (
                  <button
                    key={optIdx}
                    onClick={() => choose(optIdx)}
                    disabled={selected !== null}
                    className={cn(
                      "rounded-2xl border-2 px-5 py-3 font-medium transition-all",
                      showState && isCorrect && "border-accent bg-accent/15",
                      showState && !isCorrect && optIdx === selected && "border-danger bg-danger/15",
                      !showState && "border-transparent bg-foreground/8 hover:bg-foreground/15"
                    )}
                  >
                    {t.emotions[EMOTIONS[optIdx].key]}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            celebratory
            stats={[
              { label: t.common.accuracy, value: `${Math.round(result.accuracy)}%` },
              { label: t.common.score, value: `${Math.round(result.avgReactionMs)}ms` },
            ]}
            onNext={() => navigate("/games/letter-race")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function EmotionFriendsGame() {
  return (
    <RequireProfile>
      <EmotionFriendsContent />
    </RequireProfile>
  );
}
