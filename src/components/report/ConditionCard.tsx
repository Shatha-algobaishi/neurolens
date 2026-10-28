import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ConditionIndicator } from "../../engine/types";
import { useLanguage } from "../../lib/i18n/context";
import { Chip } from "../ui/Chip";
import { cn } from "../../lib/utils";

export function ConditionCard({ indicator }: { indicator: ConditionIndicator }) {
  const { t, dir } = useLanguage();
  const [open, setOpen] = useState(false);

  const toneMap = { typical: "success", notable: "warning", refer: "danger" } as const;
  const labelMap = { typical: t.report.levelTypical, notable: t.report.levelNotable, refer: t.report.levelRefer };

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 p-4 text-start">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{t.conditions[indicator.id].name}</p>
          <Chip tone={toneMap[indicator.level]} className="mt-1.5">
            {labelMap[indicator.level]}
          </Chip>
        </div>
        <ChevronDown size={18} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} dir={dir}>
            <p className="px-4 pb-4 text-sm text-foreground/70 leading-relaxed">{t.advice[indicator.id]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
