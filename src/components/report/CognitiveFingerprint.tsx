import { motion } from "framer-motion";
import { DOMAIN_ORDER } from "../../engine/scoring";
import type { DomainScores } from "../../engine/types";

const SIZE = 320;
const CENTER = SIZE / 2;
const RING_GAP = 12;
const BASE_RADIUS = 34;

const COLORS = ["#8B5CF6", "#A78BFA", "#7C3AED", "#2DD4BF", "#22D3EE", "#38BDF8", "#8B5CF6", "#2DD4BF", "#A78BFA", "#22D3EE"];

export function CognitiveFingerprint({ scores }: { scores: DomainScores }) {
  const rings = DOMAIN_ORDER.map((d, i) => {
    const radius = BASE_RADIUS + i * RING_GAP;
    const circumference = 2 * Math.PI * radius;
    const value = scores[d];
    const visible = (value / 100) * circumference * 0.82; // leaves small gaps for a "fingerprint" feel
    // deterministic pseudo-random rotation per ring so the pattern feels unique, not just concentric bars
    const seed = (i * 53 + Math.round(value) * 7) % 360;
    return { radius, circumference, visible, rotation: seed, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
        <defs>
          <radialGradient id="fingerprintGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={BASE_RADIUS + DOMAIN_ORDER.length * RING_GAP + 10} fill="url(#fingerprintGlow)" />
        {rings.map((r, i) => (
          <motion.circle
            key={i}
            cx={CENTER}
            cy={CENTER}
            r={r.radius}
            fill="none"
            stroke={r.color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${r.visible} ${r.circumference}`}
            initial={{ strokeDashoffset: r.circumference, opacity: 0 }}
            animate={{ strokeDashoffset: 0, opacity: 0.9 }}
            transition={{ duration: 1.1, delay: i * 0.06, ease: "easeOut" }}
            style={{ transform: `rotate(${r.rotation}deg)`, transformOrigin: "50% 50%" }}
          />
        ))}
      </svg>
      <motion.div
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary to-secondary"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
