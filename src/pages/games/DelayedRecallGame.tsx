import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { sound } from "../../lib/sound";
import { clamp, cn } from "../../lib/utils";

const WORD_BANK = {
  ar: {
    study: ["نهر", "جبل", "مصباح", "ساعة", "غيمة", "مفتاح", "جسر", "نجمة"],
    foils: ["بحر", "شجرة", "كرسي", "باب", "قمر", "طريق", "بيت", "ورقة"],
  },
  en: {
    study: ["river", "mountain", "lamp", "clock", "cloud", "key", "bridge", "star"],
    foils: ["ocean", "tree", "chair", "door", "moon", "road", "house", "paper"],
  },
};

type Phase = "instructions" | "countdown" | "study" | "distractor" | "recall" | "complete";
const STUDY_MS = 10000;

function DelayedRecallContent() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);
  const bank = WORD_BANK[locale];

  const [phase, setPhase] = useState<Phase>("instructions");
  const [distractorCount, setDistractorCount] = useState(30);
  const [tapCount, setTapCount] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState({ recallAccuracy: 0 });

  const finishGame = useCallback(
    (finalSelected: string[]) => {
      const correctPicks = finalSelected.filter((w) => bank.study.includes(w)).length;
      const falsePicks = finalSelected.filter((w) => !bank.study.includes(w)).length;
      const recallAccuracy = clamp(((correctPicks - falsePicks * 0.5) / bank.study.length) * 100);
      setResult({ recallAccuracy });
      addGameResult({ gameId: "delayedRecall", completedAt: new Date().toISOString(), metrics: { recallAccuracy } });
      setPhase("complete");
    },
    [addGameResult, bank.study]
  );

  useEffect(() => {
    if (phase !== "distractor") return;
    const tick = setInterval(() => {
      setDistractorCount((c) => {
        if (c <= 1) {
          clearInterval(tick);
          const shuffled = [...bank.study, ...bank.foils].sort(() => Math.random() - 0.5);
          setChoices(shuffled);
          setSelected([]);
          setPhase("recall");
          return 0;
        }
        return c - 3;
      });
    }, 900);
    return () => clearInterval(tick);
  }, [phase, bank]);

  const startGame = () => setPhase("countdown");

  const toggleWord = (word: string) => {
    sound.select();
    setSelected((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]));
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.delayedRecall.name} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard icon={<BookOpen size={34} />} name={t.games.delayedRecall.name} instructions={t.games.delayedRecall.instructions} measures={t.games.delayedRecall.measures} onStart={startGame} />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => setPhase("study")}
            goLabel={t.games.delayedRecall.name}
          />
        )}

        {phase === "study" && (
          <StudyPhase words={bank.study} onDone={() => setPhase("distractor")} durationMs={STUDY_MS} />
        )}

        {phase === "distractor" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
            <Chip tone="info">{distractorCount}s</Chip>
            <p className="text-foreground/70">🧮 {tapCount}</p>
            <Button onClick={() => setTapCount((c) => c + 1)} variant="glass">
              +1
            </Button>
          </motion.div>
        )}

        {phase === "recall" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex w-full max-w-md flex-col items-center gap-6">
            <div className="grid grid-cols-4 gap-2">
              {choices.map((w) => (
                <button
                  key={w}
                  onClick={() => toggleWord(w)}
                  className={cn(
                    "rounded-xl px-2 py-2.5 text-xs font-medium transition-all",
                    selected.includes(w) ? "bg-gradient-to-br from-primary to-secondary text-white scale-105" : "bg-foreground/8 hover:bg-foreground/15"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
            <Button size="lg" onClick={() => finishGame(selected)}>
              {t.common.done}
            </Button>
          </motion.div>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            stats={[{ label: t.common.accuracy, value: `${Math.round(result.recallAccuracy)}%` }]}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

function StudyPhase({ words, onDone, durationMs }: { words: string[]; onDone: () => void; durationMs: number }) {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(Math.round(durationMs / 1000));

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          onDone();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
      <Chip tone="info">{secondsLeft}{t.common.seconds}</Chip>
      <div className="grid grid-cols-2 gap-3">
        {words.map((w) => (
          <span key={w} className="rounded-xl bg-foreground/8 px-4 py-2.5 text-sm font-semibold">
            {w}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function DelayedRecallGame() {
  return (
    <RequireProfile>
      <DelayedRecallContent />
    </RequireProfile>
  );
}
