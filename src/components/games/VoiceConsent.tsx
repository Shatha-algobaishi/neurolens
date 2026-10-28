import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { useLanguage } from "../../lib/i18n/context";

export function VoiceConsent({ onEnable, onSkip }: { onEnable: () => void; onSkip: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col items-center justify-center text-center px-4">
      <GlassCard strong className="max-w-md w-full flex flex-col items-center gap-5 py-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
          <Mic size={34} />
        </div>
        <Chip tone="warning">{t.common.experimental}</Chip>
        <h2 className="text-2xl font-bold">{t.voice.title}</h2>
        <p className="text-foreground/70 leading-relaxed">{t.voice.body}</p>
        <div className="flex w-full flex-col gap-2.5">
          <Button size="lg" fullWidth onClick={onEnable}>
            {t.voice.enable}
          </Button>
          <Button size="lg" fullWidth variant="glass" onClick={onSkip}>
            {t.voice.skip}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
