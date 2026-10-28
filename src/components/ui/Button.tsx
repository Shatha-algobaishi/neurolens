import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

type Variant = "primary" | "glass" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-primary via-primary to-secondary text-white shadow-[0_8px_30px_-8px_rgba(139,92,246,0.65)] hover:shadow-[0_12px_40px_-6px_rgba(139,92,246,0.75)]",
  glass: "glass text-foreground hover:bg-white/10",
  ghost: "bg-transparent text-foreground hover:bg-foreground/5",
  danger: "bg-danger/90 text-white hover:bg-danger",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2 gap-1.5",
  md: "text-base px-6 py-3 gap-2",
  lg: "text-lg px-8 py-4 gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  children,
  className,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-semibold tracking-tight transition-colors cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {icon}
      {children}
      {iconEnd}
    </motion.button>
  );
}
