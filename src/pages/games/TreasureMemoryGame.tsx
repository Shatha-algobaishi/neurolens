import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gem } from "lucide-react";
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
import { clamp, cn } from "../../lib/utils";

const CHEST_COLORS = ["bg-primary", "bg-secondary", "bg-accent", "bg-warning", "bg-danger", "bg-purple-500"];
type Phase = "instructions" | "countdown" | "watch" | "recall" | "complete";

function TreasureMemoryContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [result, setResult] = useState({ accuracy: 0, avgReactionMs: 0, span: 1 });

  const roundStartRef = useRef(0);
  const reactionsRef = useRef<number[]>([]);
  const mistakesRef = useRef(0);

  const playSequence = useCallback((seq: number[]) => {
    setPhase("watch");
    seq.forEach((tile, i) => {
      setTimeout(() => {
        setActiveTile(tile);
        sound.tap();
        setTimeout(() => setActiveTile(null), 380);
      }, i * 620);
    });
    setTimeout(() => {
      setUserIndex(0);
      roundStartRef.current = Date.now();
      setPhase("recall");
    }, seq.length * 620 + 300);
  }, []);

  const nextLevel = useCallback((fromLevel: number) => {
    const seq = Array.from({ length: fromLevel + 2 }, () => Math.floor(Math.random() * CHEST_COLORS.length));
    setSequence(seq);
    setTimeout(() => playSequence(seq), 500);
  }, [playSequence]);

  const finishGame = useCallback(
    (finalLevel: number) => {
      const accuracy = clamp(100 - mistakesRef.current * 15);
      const avgReactionMs = reactionsRef.current.length ? reactionsRef.current.reduce((a, b) => a + b, 0) / reactionsRef.current.length : 0;
      setResult({ accuracy, avgReactionMs, span: finalLevel + 1 });
      addGameResult({ gameId: "treasureMemory", completedAt: new Date().toISOString(), metrics: { spanReached: finalLevel + 1, accuracy, avgReactionMs } });
      sound.fail();
      setPhase("complete");
    },
    [addGameResult]
  );

  const beginSequence = () => {
    setLevel(1);
    mistakesRef.current = 0;
    reactionsRef.current = [];
    nextLevel(0);
  };

  const startGame = () => setPhase("countdown");

  const tapTile = (tileIndex: number) => {
    if (phase !== "recall") return;
    reactionsRef.current.push(Date.now() - roundStartRef.current);
    setActiveTile(tileIndex);
    setTimeout(() => setActiveTile(null), 200);

    if (tileIndex !== sequence[userIndex]) {
      sound.miss();
      mistakesRef.current += 1;
      finishGame(level);
      return;
    }
    sound.tap();
    if (userIndex + 1 === sequence.length) {
      const newLevel = level + 1;
      if (newLevel > 8) {
        finishGame(newLevel);
        return;
      }
      setLevel(newLevel);
      nextLevel(newLevel);
    } else {
      setUserIndex((i) => i + 1);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader
        title={t.games.treasureMemory.name}
        right={phase === "recall" || phase === "watch" ? <Chip tone="info">{t.common.level} {level}</Chip> : undefined}
      />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center">
        {phase === "instructions" && (
          <InstructionsCard
            icon={<Gem size={34} />}
            name={t.games.treasureMemory.name}
            instructions={t.games.treasureMemory.instructions}
            measures={t.games.treasureMemory.measures}
            onStart={startGame}
          />
        )}

        {phase === "countdown" && <Countdown onComplete={beginSequence} goLabel={t.games.treasureMemory.name} />}

        {(phase === "watch" || phase === "recall") && (
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-3 gap-4">
              {CHEST_COLORS.map((color, i) => (
                <button
                  key={i}
                  disabled={phase !== "recall"}
                  onClick={() => tapTile(i)}
                  className={cn(
                    "h-20 w-20 rounded-2xl transition-all duration-150 text-2xl grid place-items-center",
                    color,
                    activeTile === i ? "scale-110 shadow-[0_0_30px_10px_rgba(255,255,255,0.35)] opacity-100" : "opacity-40",
                    phase === "recall" && "hover:opacity-70 cursor-pointer"
                  )}
                >
                  💎
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            celebratory
            stats={[
              { label: t.common.level, value: `${result.span}` },
              { label: t.common.accuracy, value: `${Math.round(result.accuracy)}%` },
            ]}
            onNext={() => navigate("/games/color-switch")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function TreasureMemoryGame() {
  return (
    <RequireProfile>
      <TreasureMemoryContent />
    </RequireProfile>
  );
}
