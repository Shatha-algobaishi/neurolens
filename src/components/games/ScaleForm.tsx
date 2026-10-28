import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { sound } from "../../lib/sound";
import type { ScaleAnswer } from "../../types";

export function ScaleForm({ scaleId, title, questions, onDone }: { scaleId: ScaleAnswer["scaleId"]; title: string; questions: string[]; onDone: () => void }) {
  const { t, dir } = useLanguage();
  const setScaleAnswer = useAppStore((s) => s.setScaleAnswer);
  const [index, setIndex] = useState(0);

  const answer = (value: number) => {
    sound.select();
    setScaleAnswer({ scaleId, questionId: `q${index + 1}`, value });
    if (index + 1 >= questions.length) {
      setTimeout(onDone, 200);
    } else {
      setTimeout(() => setIndex((i) => i + 1), 200);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col items-center justify-center text-center px-4 w-full">
      <GlassCard strong className="max-w-md w-full flex flex-col items-center gap-5 py-9">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-foreground/60">{t.scale.scaleIntro}</p>
        <AnimatePresence mode="wait">
          <motion.p key={index} initial={{ opacity: 0, x: dir === "rtl" ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-lg font-medium min-h-14">
            {questions[index]}
          </motion.p>
        </AnimatePresence>
        <div className="flex w-full flex-col gap-2">
          {t.scale.options.map((opt, v) => (
            <button key={opt} onClick={() => answer(v)} className="w-full rounded-2xl bg-foreground/6 px-5 py-3 text-start font-medium hover:bg-foreground/12 transition-all">
              {opt}
            </button>
          ))}
        </div>
        <p className="text-xs text-foreground/40">
          {index + 1}/{questions.length}
        </p>
      </GlassCard>
    </motion.div>
  );
}
