import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { ScaleForm } from "../../components/games/ScaleForm";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { Chip } from "../../components/ui/Chip";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { sound } from "../../lib/sound";
import { clamp } from "../../lib/utils";

const TOTAL_ROUNDS = 18;
const BOX_A_REWARD_RATE = 0.72;
const BOX_B_REWARD_RATE = 0.28;

type Phase = "instructions" | "countdown" | "playing" | "scale" | "complete";

function RewardSensitivityContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [feedback, setFeedback] = useState<"win" | "lose" | null>(null);
  const [choosing, setChoosing] = useState(true);
  const [result, setResult] = useState({ rewardLearningSlope: 0 });

  const choicesRef = useRef<("A" | "B")[]>([]);

  const finishGame = useCallback(() => {
    const choices = choicesRef.current;
    const half = Math.floor(choices.length / 2);
    const firstHalf = choices.slice(0, half);
    const secondHalf = choices.slice(half);
    const rateOf = (arr: ("A" | "B")[]) => (arr.length ? arr.filter((c) => c === "A").length / arr.length : 0.5);
    const slope = clamp(rateOf(secondHalf) - rateOf(firstHalf), -1, 1) * 0.4 + 0.2;
    setResult({ rewardLearningSlope: Math.max(0.02, slope) });
    addGameResult({ gameId: "rewardSensitivity", completedAt: new Date().toISOString(), metrics: { rewardLearningSlope: Math.max(0.02, slope) } });
    setPhase("scale");
  }, [addGameResult]);

  const startGame = () => {
    choicesRef.current = [];
    setPhase("countdown");
  };

  const choose = (box: "A" | "B") => {
    if (!choosing) return;
    setChoosing(false);
    choicesRef.current.push(box);
    const rate = box === "A" ? BOX_A_REWARD_RATE : BOX_B_REWARD_RATE;
    const won = Math.random() < rate;
    setFeedback(won ? "win" : "lose");
    if (won) sound.hit();
    else sound.miss();

    setTimeout(() => {
      setFeedback(null);
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) {
        finishGame();
      } else {
        setRoundNum(next);
        setChoosing(true);
      }
    }, 700);
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.rewardSensitivity.name} right={phase === "playing" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<Gift size={34} />}
            name={t.games.rewardSensitivity.name}
            instructions={t.games.rewardSensitivity.instructions}
            measures={t.games.rewardSensitivity.measures}
            onStart={startGame}
          />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => {
              setPhase("playing");
              setRoundNum(0);
              setChoosing(true);
            }}
            goLabel={t.games.rewardSensitivity.name}
          />
        )}

        {phase === "playing" && (
          <div className="flex flex-col items-center gap-8">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.span
                  key={feedback}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={feedback === "win" ? "text-4xl" : "text-4xl grayscale opacity-60"}
                >
                  {feedback === "win" ? "🎁✨" : "📦"}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="grid grid-cols-2 gap-6">
              {(["A", "B"] as const).map((box) => (
                <motion.button
                  key={box}
                  whileTap={{ scale: 0.92 }}
                  disabled={!choosing}
                  onClick={() => choose(box)}
                  className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl disabled:opacity-60"
                >
                  <Gift size={32} />
                  <span className="font-bold">{box}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {phase === "scale" && <ScaleForm scaleId="phq9mini" title={t.scale.phq9Title} questions={[...t.scale.phq9Q]} onDone={() => setPhase("complete")} />}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            stats={[{ label: t.common.score, value: `${Math.round(result.rewardLearningSlope * 100)}%` }]}
            onNext={() => navigate("/games/trail-making")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function RewardSensitivityGame() {
  return (
    <RequireProfile>
      <RewardSensitivityContent />
    </RequireProfile>
  );
}
