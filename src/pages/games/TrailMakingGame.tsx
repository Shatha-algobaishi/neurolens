import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Route } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { sound } from "../../lib/sound";
import { cn } from "../../lib/utils";

const AR_LETTERS = ["أ", "ب", "ج", "د", "ه"];
const EN_LETTERS = ["A", "B", "C", "D", "E"];

type Phase = "instructions" | "countdown" | "playing" | "complete";
interface Node {
  label: string;
  order: number;
  x: number;
  y: number;
}

function buildNodes(letters: string[]): Node[] {
  const sequence: { label: string; order: number }[] = [];
  for (let i = 0; i < 5; i++) {
    sequence.push({ label: String(i + 1), order: sequence.length });
    sequence.push({ label: letters[i], order: sequence.length });
  }
  const positions: { x: number; y: number }[] = [];
  while (positions.length < sequence.length) {
    const candidate = { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 };
    const tooClose = positions.some((p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) < 18);
    if (!tooClose) positions.push(candidate);
  }
  return sequence.map((s, i) => ({ ...s, x: positions[i].x, y: positions[i].y }));
}

function TrailMakingContent() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nextOrder, setNextOrder] = useState(0);
  const [result, setResult] = useState({ trailTimeMs: 0 });

  const startTimeRef = useRef(0);

  const finishGame = useCallback(() => {
    const trailTimeMs = Date.now() - startTimeRef.current;
    setResult({ trailTimeMs });
    addGameResult({ gameId: "trailMaking", completedAt: new Date().toISOString(), metrics: { trailTimeMs } });
    sound.success();
    setPhase("complete");
  }, [addGameResult]);

  const startGame = () => {
    setNodes(buildNodes(locale === "ar" ? AR_LETTERS : EN_LETTERS));
    setNextOrder(0);
    setPhase("countdown");
  };

  const tapNode = (node: Node) => {
    if (node.order !== nextOrder) {
      sound.miss();
      return;
    }
    sound.tap();
    if (nextOrder + 1 >= nodes.length) {
      finishGame();
    } else {
      setNextOrder((o) => o + 1);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.trailMaking.name} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh]">
        {phase === "instructions" && (
          <InstructionsCard icon={<Route size={34} />} name={t.games.trailMaking.name} instructions={t.games.trailMaking.instructions} measures={t.games.trailMaking.measures} onStart={startGame} />
        )}

        {phase === "countdown" && (
          <Countdown
            onComplete={() => {
              startTimeRef.current = Date.now();
              setPhase("playing");
            }}
            goLabel={t.games.trailMaking.name}
          />
        )}

        {phase === "playing" && (
          <div className="relative h-full w-full">
            {nodes.map((node) => {
              const done = node.order < nextOrder;
              const isNext = node.order === nextOrder;
              return (
                <button
                  key={node.order}
                  onClick={() => tapNode(node)}
                  className={cn(
                    "absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold shadow-lg transition-all",
                    done ? "bg-accent/40 text-foreground/50" : isNext ? "bg-gradient-to-br from-primary to-secondary text-white scale-110" : "bg-foreground/10 text-foreground/70"
                  )}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  {node.label}
                </button>
              );
            })}
          </div>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            stats={[{ label: t.common.score, value: `${(result.trailTimeMs / 1000).toFixed(1)}s` }]}
            onNext={() => navigate("/games/finger-tapping")}
            nextLabel={t.common.next}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function TrailMakingGame() {
  return (
    <RequireProfile>
      <TrailMakingContent />
    </RequireProfile>
  );
}
