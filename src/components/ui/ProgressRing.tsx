import { motion } from "framer-motion";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  size = 140,
  strokeWidth = 12,
  colorFrom = "#8B5CF6",
  colorTo = "#2DD4BF",
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const gradientId = `ring-gradient-${colorFrom.replace("#", "")}-${colorTo.replace("#", "")}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{Math.round(value)}</span>
        {label && <span className="text-xs text-foreground/60 mt-0.5">{label}</span>}
        {sublabel && <span className="text-[10px] text-foreground/40">{sublabel}</span>}
      </div>
    </div>
  );
}
