import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Palette, Circle, Square } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { Chip } from "../../components/ui/Chip";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { sound } from "../../lib/sound";
import { clamp } from "../../lib/utils";

const TOTAL_ROUNDS = 12;
const SWITCH_AT = 6;
const COLORS = [{ id: "violet", hex: "#8B5CF6" }, { id: "teal", hex: "#2DD4BF" }];

type Phase = "instructions" | "countdown" | "playing" | "complete";
interface Token {
  colorIdx: 0 | 1;
  isCircle: boolean;
}

function ColorSwitchContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [token, setToken] = useState<Token | null>(null);
  const [result, setResult] = useState({ accuracy: 0, switchCostMs: 0 });

  const shownAtRef = useRef(0);
  const statsRef = useRef({ correct: 0, preSwitchRTs: [] as number[], switchRT: 0 });

  const rule = (round: number) => (round < SWITCH_AT ? "color" : "shape");

  const finishGame = useCallback(() => {
    const accuracy = clamp((statsRef.current.correct / TOTAL_ROUNDS) * 100);
    const baseline = statsRef.current.preSwitchRTs.length
      ? statsRef.current.preSwitchRTs.reduce((a, b) => a + b, 0) / statsRef.current.preSwitchRTs.length
      : 500;
    const switchCostMs = Math.max(0, statsRef.current.switchRT - baseline);
    setResult({ accuracy, switchCostMs });
    addGameResult({ gameId: "colorSwitch", completedAt: new Date().toISOString(), metrics: { accuracy, switchCostMs } });
    setPhase("complete");
  }, [addGameResult]);

  const loadRound = useCallback((idx: number) => {
    setToken({ colorIdx: Math.random() < 0.5 ? 0 : 1, isCircle: Math.random() < 0.5 });
    setRoundNum(idx);
    shownAtRef.current = Date.now();
  }, []);

  const startGame = () => {
    statsRef.current = { correct: 0, preSwitchRTs: [], switchRT: 0 };
    setPhase("countdown");
  };

  const choose = (choice: 0 | 1 | "circle" | "square") => {
    if (!token) return;
    const rt = Date.now() - shownAtRef.current;
    const currentRule = rule(roundNum);
    const correct = currentRule === "color" ? choice === token.colorIdx : choice === (token.isCircle ? "circle" : "square");

    if (correct) {
      statsRef.current.correct += 1;
      sound.hit();
    } else {
      sound.miss();
    }
    if (roundNum < SWITCH_AT - 1) statsRef.current.preSwitchRTs.push(rt);
    if (roundNum === SWITCH_AT) statsRef.current.switchRT = rt;

    setTimeout(() => {
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) finishGame();
      else loadRound(next);
    }, 450);
  };

  const currentRule = rule(roundNum);

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.colorSwitch.name} right={phase === "playing" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<Palette size={34} />}
            name={t.games.colorSwitch.name}
            instructions={t.games.colorSwitch.instructions}
            measures={t.games.colorSwitch.measures}
            onStart={startGame}
          />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => {
              setPhase("playing");
              loadRound(0);
            }}
            goLabel={t.games.colorSwitch.name}
          />
        )}

        {phase === "playing" && token && (
          <motion.div key={roundNum} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-8">
            <Chip tone={currentRule === "color" ? "info" : "warning"}>{currentRule === "color" ? t.domains.flexibility : t.domains.executiveFunction}</Chip>
            <div className="flex h-24 w-24 items-center justify-center">
              {token.isCircle ? <Circle size={72} fill={COLORS[token.colorIdx].hex} color={COLORS[token.colorIdx].hex} /> : <Square size={72} fill={COLORS[token.colorIdx].hex} color={COLORS[token.colorIdx].hex} />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {currentRule === "color"
                ? COLORS.map((c, i) => (
                    <button key={c.id} onClick={() => choose(i as 0 | 1)} className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-transparent bg-foreground/8 hover:bg-foreground/15">
                      <span className="h-8 w-8 rounded-full" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))
                : (["circle", "square"] as const).map((s) => (
                    <button key={s} onClick={() => choose(s)} className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-transparent bg-foreground/8 hover:bg-foreground/15">
                      {s === "circle" ? <Circle size={28} /> : <Square size={28} />}
                    </button>
                  ))}
            </div>
          </motion.div>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            celebratory
            stats={[
              { label: t.common.accuracy, value: `${Math.round(result.accuracy)}%` },
              { label: t.common.score, value: `${Math.round(result.switchCostMs)}ms` },
            ]}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function ColorSwitchGame() {
  return (
    <RequireProfile>
      <ColorSwitchContent />
    </RequireProfile>
  );
}
