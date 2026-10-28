import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair } from "lucide-react";
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

const TOTAL_ROUNDS = 14;
const WORD_MS = 500;

const WORD_PAIRS = {
  ar: { neutral: ["طاولة", "كتاب", "نافذة", "سيارة", "حديقة", "قلم"], threat: ["خطر", "فشل", "قلق", "تهديد", "ألم", "خوف"] },
  en: { neutral: ["table", "book", "window", "garden", "pencil", "chair"], threat: ["danger", "failure", "threat", "panic", "fear", "pain"] },
};

type Phase = "instructions" | "countdown" | "words" | "probe" | "scale" | "complete";
interface Round {
  key: number;
  threatOnTop: boolean;
  dotOnTop: boolean;
  neutralWord: string;
  threatWord: string;
}

function DotProbeContent() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);
  const words = WORD_PAIRS[locale];

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [result, setResult] = useState({ accuracy: 0, threatBiasMs: 0 });

  const shownAtRef = useRef(0);
  const statsRef = useRef({ correct: 0, threatRTs: [] as number[], neutralRTs: [] as number[] });

  const finishGame = useCallback(() => {
    const { correct, threatRTs, neutralRTs } = statsRef.current;
    const accuracy = clamp((correct / TOTAL_ROUNDS) * 100);
    const avgThreat = threatRTs.length ? threatRTs.reduce((a, b) => a + b, 0) / threatRTs.length : 400;
    const avgNeutral = neutralRTs.length ? neutralRTs.reduce((a, b) => a + b, 0) / neutralRTs.length : 400;
    const threatBiasMs = Math.max(0, avgNeutral - avgThreat);
    setResult({ accuracy, threatBiasMs });
    addGameResult({ gameId: "dotProbe", completedAt: new Date().toISOString(), metrics: { accuracy, threatBiasMs } });
    setPhase("scale");
  }, [addGameResult]);

  const loadRound = useCallback(
    (idx: number) => {
      const threatOnTop = Math.random() < 0.5;
      const dotOnTop = Math.random() < 0.5;
      const neutralWord = words.neutral[Math.floor(Math.random() * words.neutral.length)];
      const threatWord = words.threat[Math.floor(Math.random() * words.threat.length)];
      setRound({ key: idx, threatOnTop, dotOnTop, neutralWord, threatWord });
      setRoundNum(idx);
      setPhase("words");
      setTimeout(() => {
        shownAtRef.current = Date.now();
        setPhase("probe");
      }, WORD_MS);
    },
    [words]
  );

  const startGame = () => {
    statsRef.current = { correct: 0, threatRTs: [], neutralRTs: [] };
    setPhase("countdown");
  };

  const choose = (side: "top" | "bottom") => {
    if (!round) return;
    const rt = Date.now() - shownAtRef.current;
    const correctSide = round.dotOnTop ? "top" : "bottom";
    const dotOnThreat = round.dotOnTop === round.threatOnTop;
    if (side === correctSide) {
      statsRef.current.correct += 1;
      sound.hit();
      if (dotOnThreat) statsRef.current.threatRTs.push(rt);
      else statsRef.current.neutralRTs.push(rt);
    } else {
      sound.miss();
    }
    setTimeout(() => {
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) finishGame();
      else loadRound(next);
    }, 350);
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.dotProbe.name} right={phase !== "instructions" && phase !== "complete" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex flex-col items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard icon={<Crosshair size={34} />} name={t.games.dotProbe.name} instructions={t.games.dotProbe.instructions} measures={t.games.dotProbe.measures} onStart={startGame} />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => loadRound(0)}
            goLabel={t.games.dotProbe.name}
          />
        )}

        {(phase === "words" || phase === "probe") && round && (
          <div className="flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {phase === "words" ? (
                <motion.div key="words" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                  <span className="text-2xl font-bold">{round.threatOnTop ? round.threatWord : round.neutralWord}</span>
                  <span className="text-2xl font-bold">{round.threatOnTop ? round.neutralWord : round.threatWord}</span>
                </motion.div>
              ) : (
                <motion.div key="probe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                  <div className="h-8 flex items-center justify-center">{round.dotOnTop && <span className="h-4 w-4 rounded-full bg-gradient-to-br from-primary to-secondary" />}</div>
                  <div className="h-8 flex items-center justify-center">{!round.dotOnTop && <span className="h-4 w-4 rounded-full bg-gradient-to-br from-primary to-secondary" />}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {phase === "probe" && (
              <div className="flex flex-col gap-3">
                <button onClick={() => choose("top")} className="rounded-2xl bg-foreground/8 px-8 py-3 font-semibold hover:bg-foreground/15">
                  ▲
                </button>
                <button onClick={() => choose("bottom")} className="rounded-2xl bg-foreground/8 px-8 py-3 font-semibold hover:bg-foreground/15">
                  ▼
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "scale" && <ScaleForm scaleId="gad7mini" title={t.scale.gad7Title} questions={[...t.scale.gad7Q]} onDone={() => setPhase("complete")} />}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            stats={[
              { label: t.common.accuracy, value: `${Math.round(result.accuracy)}%` },
              { label: t.common.score, value: `${Math.round(result.threatBiasMs)}ms` },
            ]}
            onNext={() => navigate("/games/reward-sensitivity")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function DotProbeGame() {
  return (
    <RequireProfile>
      <DotProbeContent />
    </RequireProfile>
  );
}
