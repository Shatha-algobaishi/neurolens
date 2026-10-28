import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { useLanguage } from "../../lib/i18n/context";
import type { ReactNode } from "react";

export function InstructionsCard({
  icon,
  name,
  instructions,
  measures,
  demo,
  onStart,
}: {
  icon: ReactNode;
  name: string;
  instructions: string;
  measures: string;
  demo?: ReactNode;
  onStart: () => void;
}) {
  const { t } = useLanguage();
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col items-center justify-center text-center px-4">
      <GlassCard strong className="max-w-md w-full flex flex-col items-center gap-5 py-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg animate-float">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-foreground/70 leading-relaxed">{instructions}</p>
        {demo && <div className="flex h-24 items-center justify-center">{demo}</div>}
        <Chip tone="info">{measures}</Chip>
        <Button size="lg" fullWidth onClick={onStart}>
          {t.common.start}
        </Button>
      </GlassCard>
    </motion.div>
  );
}
