import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
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

const TOTAL_ROUNDS = 10;
type Phase = "instructions" | "countdown" | "playing" | "complete";

interface Problem {
  a: number;
  b: number;
  op: "+" | "-";
  answer: number;
  options: number[];
}

function buildProblem(isChild: boolean): Problem {
  const max = isChild ? 10 : 40;
  const op: "+" | "-" = Math.random() < 0.5 ? "+" : "-";
  let a = 1 + Math.floor(Math.random() * max);
  let b = 1 + Math.floor(Math.random() * max);
  if (op === "-" && b > a) [a, b] = [b, a];
  const answer = op === "+" ? a + b : a - b;

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const delta = 1 + Math.floor(Math.random() * (isChild ? 4 : 8));
    const candidate = Math.random() < 0.5 ? answer + delta : Math.max(0, answer - delta);
    if (candidate !== answer) distractors.add(candidate);
  }
  const options = [answer, ...distractors].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, options };
}

function QuickMathContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);
  const profile = useAppStore((s) => s.profile);
  const isChild = profile?.ageGroup !== "adult";

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState({ accuracy: 0, avgReactionMs: 0 });

  const shownAtRef = useRef(0);
  const statsRef = useRef({ correct: 0, reactions: [] as number[] });

  const finishGame = useCallback(() => {
    const { correct, reactions } = statsRef.current;
    const accuracy = clamp((correct / TOTAL_ROUNDS) * 100);
    const avgReactionMs = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 0;
    setResult({ accuracy, avgReactionMs });
    addGameResult({ gameId: "quickMath", completedAt: new Date().toISOString(), metrics: { accuracy, avgReactionMs } });
    setPhase("complete");
  }, [addGameResult]);

  const loadRound = useCallback(
    (idx: number) => {
      setProblem(buildProblem(isChild));
      setSelected(null);
      setRoundNum(idx);
      shownAtRef.current = Date.now();
    },
    [isChild]
  );

  const startGame = () => {
    statsRef.current = { correct: 0, reactions: [] };
    setPhase("countdown");
  };

  const choose = (value: number) => {
    if (!problem || selected !== null) return;
    setSelected(value);
    statsRef.current.reactions.push(Date.now() - shownAtRef.current);
    if (value === problem.answer) {
      statsRef.current.correct += 1;
      sound.hit();
    } else {
      sound.miss();
    }
    setTimeout(() => {
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) finishGame();
      else loadRound(next);
    }, 550);
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.quickMath.name} right={phase === "playing" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<Calculator size={34} />}
            name={t.games.quickMath.name}
            instructions={t.games.quickMath.instructions}
            measures={t.games.quickMath.measures}
            demo={
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-3xl font-black gradient-text">
                7 + 5 = ?
              </motion.span>
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
            goLabel={t.games.quickMath.name}
          />
        )}

        {phase === "playing" && problem && (
          <motion.div key={roundNum} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-10">
            <span className="text-5xl font-black gradient-text tabular-nums">
              {problem.a} {problem.op} {problem.b}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {problem.options.map((opt) => {
                const isCorrect = opt === problem.answer;
                const showState = selected !== null;
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={selected !== null}
                    className={cn(
                      "flex h-16 w-20 items-center justify-center rounded-2xl border-2 text-xl font-bold tabular-nums transition-all",
                      showState && isCorrect && "border-accent bg-accent/15",
                      showState && !isCorrect && opt === selected && "border-danger bg-danger/15",
                      !showState && "border-transparent bg-foreground/8 hover:bg-foreground/15"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            celebratory={isChild}
            stats={[
              { label: t.common.accuracy, value: `${Math.round(result.accuracy)}%` },
              { label: t.common.score, value: `${Math.round(result.avgReactionMs)}ms` },
            ]}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function QuickMathGame() {
  return (
    <RequireProfile>
      <QuickMathContent />
    </RequireProfile>
  );
}
