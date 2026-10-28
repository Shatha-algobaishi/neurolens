import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

export function Chip({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "success" | "warning" | "info" | "danger";
}) {
  const tones: Record<string, string> = {
    default: "bg-foreground/8 text-foreground/70",
    success: "bg-accent/15 text-accent",
    warning: "bg-warning/15 text-warning",
    info: "bg-secondary/15 text-secondary",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
