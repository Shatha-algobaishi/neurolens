import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function ConditionFlipCard({
  icon: Icon,
  name,
  blurb,
  gradient,
}: {
  icon: LucideIcon;
  name: string;
  blurb: string;
  gradient: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-40 [perspective:1000px] cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="glass absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl p-4 text-center [backface-visibility:hidden]">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white`}>
            <Icon size={22} />
          </div>
          <p className="text-sm font-semibold">{name}</p>
        </div>
        <div
          className="glass-strong absolute inset-0 flex items-center justify-center rounded-3xl p-4 text-center text-xs text-foreground/75 leading-relaxed [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          {blurb}
        </div>
      </motion.div>
    </div>
  );
}
