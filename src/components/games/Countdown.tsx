import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sound } from "../../lib/sound";

export function Countdown({ onComplete, goLabel }: { onComplete: () => void; goLabel: string }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    sound.countdown();
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.span
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.4, opacity: 0 }}
        className="text-7xl font-black gradient-text"
      >
        {count === 0 ? goLabel : count}
      </motion.span>
    </div>
  );
}
