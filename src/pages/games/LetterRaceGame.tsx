import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Type } from "lucide-react";
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

const TOTAL_ROUNDS = 8;
const AR_LETTERS = ["ب", "ت", "ث", "ج", "ح", "خ", "د", "ر", "س", "ش"];
const EN_LETTERS = ["B", "D", "P", "Q", "M", "N", "V", "W", "F", "T"];

type Phase = "instructions" | "countdown" | "flash" | "choose" | "complete";
interface Round {
  target: string;
  options: string[];
}

function buildRound(pool: string[]): Round {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const options = shuffled.slice(0, 4);
  const target = options[Math.floor(Math.random() * options.length)];
  return { target, options };
}

function LetterRaceContent() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);
  const pool = locale === "ar" ? AR_LETTERS : EN_LETTERS;

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState({ accuracy: 0, avgReactionMs: 0 });

  const shownAtRef = useRef(0);
  const statsRef = useRef({ correct: 0, reactions: [] as number[] });

  const finishGame = useCallback(() => {
    const { correct, reactions } = statsRef.current;
    const accuracy = clamp((correct / TOTAL_ROUNDS) * 100);
    const avgReactionMs = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 1200;
    setResult({ accuracy, avgReactionMs });
    addGameResult({ gameId: "letterRace", completedAt: new Date().toISOString(), metrics: { phonemeAccuracy: accuracy, namingSpeedMs: avgReactionMs } });
    setPhase("complete");
  }, [addGameResult]);

  const loadRound = useCallback(
    (idx: number) => {
      const r = buildRound(pool);
      setRound(r);
      setSelected(null);
      setRoundNum(idx);
      setPhase("flash");
      setTimeout(() => {
        shownAtRef.current = Date.now();
        setPhase("choose");
      }, 650);
    },
    [pool]
  );

  const startGame = () => {
    statsRef.current = { correct: 0, reactions: [] };
    setPhase("countdown");
  };

  const choose = (letter: string) => {
    if (!round || selected !== null) return;
    setSelected(letter);
    statsRef.current.reactions.push(Date.now() - shownAtRef.current);
    if (letter === round.target) {
      statsRef.current.correct += 1;
      sound.hit();
    } else {
      sound.miss();
    }
    setTimeout(() => {
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) finishGame();
      else loadRound(next);
    }, 650);
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.letterRace.name} right={phase !== "instructions" && phase !== "complete" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<Type size={34} />}
            name={t.games.letterRace.name}
            instructions={t.games.letterRace.instructions}
            measures={t.games.letterRace.measures}
            demo={
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-4xl font-black gradient-text">
                {pool[0]}
              </motion.div>
            }
            onStart={startGame}
          />
        )}

        {phase === "countdown" && <Countdown onComplete={() => loadRound(0)} goLabel={t.games.letterRace.name} />}

        {phase === "flash" && round && (
          <AnimatePresence mode="wait">
            <motion.span key={round.target} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl font-black gradient-text">
              {round.target}
            </motion.span>
          </AnimatePresence>
        )}

        {phase === "choose" && round && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
            {round.options.map((letter) => {
              const isCorrect = letter === round.target;
              const showState = selected !== null;
              return (
                <button
                  key={letter}
                  onClick={() => choose(letter)}
                  disabled={selected !== null}
                  className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-3xl font-bold transition-all",
                    showState && isCorrect && "border-accent bg-accent/15",
                    showState && !isCorrect && letter === selected && "border-danger bg-danger/15",
                    !showState && "border-transparent bg-foreground/8 hover:bg-foreground/15"
                  )}
                >
                  {letter}
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
            onNext={() => navigate("/games/number-world")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function LetterRaceGame() {
  return (
    <RequireProfile>
      <LetterRaceContent />
    </RequireProfile>
  );
}
