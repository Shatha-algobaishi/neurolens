import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  strong?: boolean;
  hover?: boolean;
}

export function GlassCard({ children, className, strong = false, hover = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-3xl p-6",
        strong ? "glass-strong" : "glass",
        hover && "transition-transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
