import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
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

const DURATION = 20;
type Phase = "instructions" | "countdown" | "playing" | "complete";

function FingerTappingContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [tapCount, setTapCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [result, setResult] = useState({ tapVariability: 0, tapCount: 0 });

  const lastTapRef = useRef<number | null>(null);
  const intervalsRef = useRef<number[]>([]);

  const finishGame = useCallback(() => {
    const intervals = intervalsRef.current;
    const mean = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const variance = intervals.length ? intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length : 0;
    const tapVariability = Math.sqrt(variance);
    setResult({ tapVariability, tapCount: intervals.length + (intervals.length ? 1 : 0) });
    addGameResult({ gameId: "fingerTapping", completedAt: new Date().toISOString(), metrics: { tapVariability } });
    setPhase("complete");
  }, [addGameResult]);

  useEffect(() => {
    if (phase !== "playing") return;
    const tick = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [phase, finishGame]);

  const startGame = () => {
    intervalsRef.current = [];
    lastTapRef.current = null;
    setTapCount(0);
    setTimeLeft(DURATION);
    setPhase("countdown");
  };

  const handleTap = () => {
    if (phase !== "playing") return;
    const now = Date.now();
    if (lastTapRef.current !== null) {
      intervalsRef.current.push(now - lastTapRef.current);
    }
    lastTapRef.current = now;
    setTapCount((c) => c + 1);
    setPulse(true);
    setTimeout(() => setPulse(false), 100);
    sound.tap();
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.fingerTapping.name} right={phase === "playing" ? <Chip tone="info">{timeLeft}s</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex flex-col items-center justify-center gap-8">
        {phase === "instructions" && (
          <InstructionsCard icon={<Fingerprint size={34} />} name={t.games.fingerTapping.name} instructions={t.games.fingerTapping.instructions} measures={t.games.fingerTapping.measures} onStart={startGame} />
        )}

        {phase === "countdown" && <Countdown onComplete={() => setPhase("playing")} goLabel={t.games.fingerTapping.name} />}

        {phase === "playing" && (
          <>
            <p className="text-5xl font-black gradient-text tabular-nums">{tapCount}</p>
            <motion.button
              animate={{ scale: pulse ? 0.88 : 1 }}
              onClick={handleTap}
              className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-2xl"
            >
              <Fingerprint size={56} />
            </motion.button>
          </>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            stats={[
              { label: t.common.score, value: `${result.tapCount}` },
              { label: t.common.accuracy, value: `${Math.round(result.tapVariability)}ms` },
            ]}
            onNext={() => navigate("/games/delayed-recall")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function FingerTappingGame() {
  return (
    <RequireProfile>
      <FingerTappingContent />
    </RequireProfile>
  );
}
