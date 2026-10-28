import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { useLanguage } from "../../lib/i18n/context";
import { sound } from "../../lib/sound";

export function CompleteOverlay({
  title,
  celebratory = false,
  stats,
  onNext,
  nextLabel,
  onBackToHub,
  backLabel,
}: {
  title: string;
  celebratory?: boolean;
  stats: { label: string; value: string }[];
  onNext?: () => void;
  nextLabel?: string;
  onBackToHub: () => void;
  backLabel: string;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    sound.success();
    if (!celebratory) return;
    const end = Date.now() + 900;
    const colors = ["#8B5CF6", "#2DD4BF", "#22D3EE", "#FBBF24"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [celebratory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-sm px-4"
    >
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <GlassCard strong className="w-[min(92vw,26rem)] flex flex-col items-center gap-6 py-9">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{title}</span>
          <div className="grid w-full grid-cols-2 gap-3 text-center">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-foreground/5 py-3">
                <p className="text-xs text-foreground/50">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="flex w-full flex-col gap-2.5">
            {onNext && (
              <Button fullWidth onClick={onNext}>
                {nextLabel ?? t.common.next}
              </Button>
            )}
            <Button fullWidth variant="glass" onClick={onBackToHub}>
              {backLabel}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
