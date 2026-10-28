import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function ScoreBar({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-medium text-foreground/80">{label}</span>
        <span className="tabular-nums font-semibold">{Math.round(value)}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-foreground/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
