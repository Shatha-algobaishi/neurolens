import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Hand } from "lucide-react";
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
import { clamp } from "../../lib/utils";

const TOTAL_ROUNDS = 24;
const SHOW_MS = 850;
type Phase = "instructions" | "countdown" | "playing" | "complete";
interface Round {
  key: number;
  isGo: boolean;
}

function GoNoGoContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundsShown, setRoundsShown] = useState(0);
  const [current, setCurrent] = useState<Round | null>(null);
  const [result, setResult] = useState({ accuracy: 0, avgReactionMs: 0 });

  const statsRef = useRef({ hits: 0, omissions: 0, falseAlarms: 0, reactions: [] as number[] });
  const shownAtRef = useRef(0);
  const tappedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishGame = useCallback(() => {
    const { omissions, falseAlarms, reactions } = statsRef.current;
    const accuracy = clamp(((TOTAL_ROUNDS - omissions - falseAlarms) / TOTAL_ROUNDS) * 100);
    const avgReactionMs = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 0;
    setResult({ accuracy, avgReactionMs });
    addGameResult({ gameId: "goNoGo", completedAt: new Date().toISOString(), metrics: { accuracy, avgReactionMs, omissionErrors: omissions, commissionErrors: falseAlarms } });
    setPhase("complete");
  }, [addGameResult]);

  const showRound = useCallback(
    (index: number) => {
      if (index >= TOTAL_ROUNDS) {
        setCurrent(null);
        finishGame();
        return;
      }
      const isGo = Math.random() < 0.72;
      const round: Round = { key: index, isGo };
      tappedRef.current = false;
      setCurrent(round);
      setRoundsShown(index);
      shownAtRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        if (!tappedRef.current && round.isGo) statsRef.current.omissions += 1;
        showRound(index + 1);
      }, SHOW_MS);
    },
    [finishGame]
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const startGame = () => {
    statsRef.current = { hits: 0, omissions: 0, falseAlarms: 0, reactions: [] };
    setPhase("countdown");
  };

  const handleTap = () => {
    if (!current || tappedRef.current) return;
    tappedRef.current = true;
    const reaction = Date.now() - shownAtRef.current;
    if (current.isGo) {
      statsRef.current.hits += 1;
      statsRef.current.reactions.push(reaction);
      sound.hit();
    } else {
      statsRef.current.falseAlarms += 1;
      sound.miss();
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.goNoGo.name} right={phase === "playing" ? <Chip tone="info">{roundsShown}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center">
        {phase === "instructions" && (
          <InstructionsCard icon={<Hand size={34} />} name={t.games.goNoGo.name} instructions={t.games.goNoGo.instructions} measures={t.games.goNoGo.measures} onStart={startGame} />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => {
              setPhase("playing");
              showRound(0);
            }}
            goLabel={t.games.goNoGo.name}
          />
        )}

        {phase === "playing" && (
          <AnimatePresence mode="wait">
            {current && (
              <motion.button
                key={current.key}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                onClick={handleTap}
                className="h-44 w-44 rounded-full shadow-2xl"
                style={{ backgroundColor: current.isGo ? "#22C55E" : "#F43F5E" }}
                aria-label={current.isGo ? "go" : "no-go"}
              />
            )}
          </AnimatePresence>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            stats={[
              { label: t.common.accuracy, value: `${Math.round(result.accuracy)}%` },
              { label: t.common.score, value: `${Math.round(result.avgReactionMs)}ms` },
            ]}
            onNext={() => navigate("/games/dot-probe")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function GoNoGoGame() {
  return (
    <RequireProfile>
      <GoNoGoContent />
    </RequireProfile>
  );
}
