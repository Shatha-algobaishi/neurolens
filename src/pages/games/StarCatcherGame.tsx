import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Moon } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { Chip } from "../../components/ui/Chip";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { sound } from "../../lib/sound";
import { clamp } from "../../lib/utils";

const DURATION = 45;

interface Orb {
  id: number;
  isStar: boolean;
  top: number;
  left: number;
  spawnedAt: number;
}

type Phase = "instructions" | "countdown" | "playing" | "complete";

function StarCatcherContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [result, setResult] = useState({ accuracy: 0, avgReactionMs: 0 });

  const statsRef = useRef({ hits: 0, misses: 0, falseHits: 0, reactions: [] as number[] });
  const orbIdRef = useRef(0);

  const spawnOrb = useCallback(() => {
    const isStar = Math.random() < 0.55;
    const orb: Orb = { id: orbIdRef.current++, isStar, top: 12 + Math.random() * 68, left: 10 + Math.random() * 75, spawnedAt: Date.now() };
    setOrbs((prev) => [...prev, orb]);
    setTimeout(() => {
      setOrbs((prev) => {
        const stillThere = prev.find((o) => o.id === orb.id);
        if (stillThere && orb.isStar) statsRef.current.misses += 1;
        return prev.filter((o) => o.id !== orb.id);
      });
    }, 1100);
  }, []);

  const finishGame = useCallback(() => {
    const { hits, misses, falseHits, reactions } = statsRef.current;
    const total = hits + misses + falseHits;
    const accuracy = total > 0 ? clamp((hits / total) * 100) : 0;
    const avgReactionMs = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 0;
    setResult({ accuracy, avgReactionMs });

    addGameResult({
      gameId: "starCatcher",
      completedAt: new Date().toISOString(),
      metrics: { accuracy, avgReactionMs, omissionErrors: misses, commissionErrors: falseHits },
    });
    setPhase("complete");
  }, [addGameResult]);

  useEffect(() => {
    if (phase !== "playing") return;
    const spawnInterval = setInterval(spawnOrb, 750);
    const tickInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(spawnInterval);
          clearInterval(tickInterval);
          setOrbs([]);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawnInterval);
      clearInterval(tickInterval);
    };
  }, [phase, spawnOrb, finishGame]);

  const startGame = () => {
    statsRef.current = { hits: 0, misses: 0, falseHits: 0, reactions: [] };
    setTimeLeft(DURATION);
    setOrbs([]);
    setPhase("countdown");
  };

  const tapOrb = (orb: Orb) => {
    setOrbs((prev) => prev.filter((o) => o.id !== orb.id));
    if (orb.isStar) {
      statsRef.current.hits += 1;
      statsRef.current.reactions.push(Date.now() - orb.spawnedAt);
      sound.hit();
    } else {
      statsRef.current.falseHits += 1;
      sound.miss();
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.starCatcher.name} right={phase === "playing" ? <Chip tone="info">{timeLeft}s</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh]">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<Star size={34} />}
            name={t.games.starCatcher.name}
            instructions={t.games.starCatcher.instructions}
            measures={t.games.starCatcher.measures}
            demo={
              <div className="flex items-center gap-6">
                <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-yellow-400">
                  <Star size={36} fill="currentColor" />
                </motion.div>
                <motion.div animate={{ x: [0, 6, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="text-foreground/25">
                  <Moon size={36} />
                </motion.div>
              </div>
            }
            onStart={startGame}
          />
        )}

        {phase === "countdown" && <Countdown onComplete={() => setPhase("playing")} goLabel={t.games.starCatcher.name} />}

        {phase === "playing" && (
          <AnimatePresence>
            {orbs.map((orb) => (
              <motion.button
                key={orb.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => tapOrb(orb)}
                className={orb.isStar ? "absolute text-yellow-400" : "absolute text-slate-400"}
                style={{ top: `${orb.top}%`, left: `${orb.left}%` }}
                aria-label={orb.isStar ? "star" : "moon"}
              >
                {orb.isStar ? <Star size={44} fill="currentColor" /> : <Moon size={44} fill="currentColor" />}
              </motion.button>
            ))}
          </AnimatePresence>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            celebratory
            stats={[
              { label: t.common.accuracy, value: `${Math.round(result.accuracy)}%` },
              { label: t.common.score, value: `${Math.round(result.avgReactionMs)}ms` },
            ]}
            onNext={() => navigate("/games/emotion-friends")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function StarCatcherGame() {
  return (
    <RequireProfile>
      <StarCatcherContent />
    </RequireProfile>
  );
}
