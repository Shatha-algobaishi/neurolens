import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";
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
import { clamp, randRange } from "../../lib/utils";

const TOTAL_ROUNDS = 8;
type Phase = "instructions" | "countdown" | "playing" | "complete";

interface DotGroup {
  count: number;
  dots: { x: number; y: number }[];
}
interface Round {
  left: DotGroup;
  right: DotGroup;
}

function makeGroup(count: number): DotGroup {
  const dots = Array.from({ length: count }, () => ({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 }));
  return { count, dots };
}

function buildRound(): Round {
  const a = Math.floor(randRange(3, 10));
  let b = Math.floor(randRange(3, 10));
  while (b === a) b = Math.floor(randRange(3, 10));
  return { left: makeGroup(a), right: makeGroup(b) };
}

function NumberWorldContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [selected, setSelected] = useState<"left" | "right" | null>(null);
  const [result, setResult] = useState({ accuracy: 0, avgReactionMs: 0 });

  const shownAtRef = useRef(0);
  const statsRef = useRef({ correct: 0, reactions: [] as number[] });

  const finishGame = useCallback(() => {
    const { correct, reactions } = statsRef.current;
    const accuracy = clamp((correct / TOTAL_ROUNDS) * 100);
    const avgReactionMs = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 0;
    setResult({ accuracy, avgReactionMs });
    addGameResult({ gameId: "numberWorld", completedAt: new Date().toISOString(), metrics: { accuracy, avgReactionMs } });
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

  const choose = (side: "left" | "right") => {
    if (!round || selected !== null) return;
    setSelected(side);
    statsRef.current.reactions.push(Date.now() - shownAtRef.current);
    const correct = round[side].count > round[side === "left" ? "right" : "left"].count;
    if (correct) {
      statsRef.current.correct += 1;
      sound.hit();
    } else {
      sound.miss();
    }
    setTimeout(() => {
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) finishGame();
      else loadRound(next);
    }, 600);
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.numberWorld.name} right={phase === "playing" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<Hash size={34} />}
            name={t.games.numberWorld.name}
            instructions={t.games.numberWorld.instructions}
            measures={t.games.numberWorld.measures}
            onStart={startGame}
          />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => {
              setPhase("playing");
              loadRound(0);
            }}
            goLabel={t.games.numberWorld.name}
          />
        )}

        {phase === "playing" && round && (
          <motion.div key={roundNum} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid w-full max-w-md grid-cols-2 gap-4">
            {(["left", "right"] as const).map((side) => {
              const showState = selected !== null;
              const isChosen = selected === side;
              const isBigger = round[side].count > round[side === "left" ? "right" : "left"].count;
              return (
                <button
                  key={side}
                  onClick={() => choose(side)}
                  disabled={selected !== null}
                  className={
                    "relative h-44 rounded-3xl border-2 transition-all " +
                    (showState && isBigger ? "border-accent bg-accent/10" : showState && isChosen ? "border-danger bg-danger/10" : "border-transparent bg-foreground/8")
                  }
                >
                  {round[side].dots.map((d, i) => (
                    <span key={i} className="absolute h-4 w-4 rounded-full bg-gradient-to-br from-primary to-secondary" style={{ left: `${d.x}%`, top: `${d.y}%` }} />
                  ))}
                </button>
              );
            })}
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
            onNext={() => navigate("/games/treasure-memory")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function NumberWorldGame() {
  return (
    <RequireProfile>
      <NumberWorldContent />
    </RequireProfile>
  );
}
