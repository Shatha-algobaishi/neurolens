import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { WebcamConsent } from "../../components/games/WebcamConsent";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { Chip } from "../../components/ui/Chip";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { AttentionTracker } from "../../lib/webcam/attentionTracker";
import { clamp, randRange } from "../../lib/utils";

const DURATION = 14;
type Phase = "instructions" | "consent" | "countdown" | "playing" | "complete";

function FaceFocusContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);
  const profile = useAppStore((s) => s.profile);
  const isChild = profile?.ageGroup !== "adult";

  const [phase, setPhase] = useState<Phase>("instructions");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [result, setResult] = useState<{ engagementScore?: number }>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<AttentionTracker | null>(null);
  const hadCameraRef = useRef(false);

  const cleanup = useCallback(() => {
    trackerRef.current?.stop();
    trackerRef.current = null;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback(
    (hadCamera: boolean) => {
      const drops = trackerRef.current?.dropsCount ?? 0;
      cleanup();
      const engagementScore = hadCamera ? clamp(100 - drops * 10) : undefined;
      addGameResult({
        gameId: "faceFocus",
        completedAt: new Date().toISOString(),
        metrics: engagementScore !== undefined ? { engagementScore } : {},
      });
      setResult({ engagementScore });
      setPhase("complete");
    },
    [addGameResult, cleanup]
  );

  const startGame = () => setPhase("consent");

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        trackerRef.current = new AttentionTracker(videoRef.current);
        trackerRef.current.start(() => {});
        hadCameraRef.current = true;
      }
    } catch {
      hadCameraRef.current = false;
    }
    setTimeLeft(DURATION);
    setPhase("countdown");
  };

  const skipCamera = () => {
    hadCameraRef.current = false;
    setTimeLeft(DURATION);
    setPhase("countdown");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const moveInterval = setInterval(() => setTarget({ x: randRange(15, 85), y: randRange(15, 85) }), 1400);
    const tick = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(moveInterval);
          clearInterval(tick);
          finish(hadCameraRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(moveInterval);
      clearInterval(tick);
    };
  }, [phase, finish]);

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.faceFocus.name} right={phase === "playing" ? <Chip tone="info">{timeLeft}s</Chip> : undefined} />
      <video ref={videoRef} muted playsInline className="hidden" />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh]">
        {phase === "instructions" && (
          <InstructionsCard icon={<Eye size={34} />} name={t.games.faceFocus.name} instructions={t.games.faceFocus.instructions} measures={t.games.faceFocus.measures} onStart={startGame} />
        )}

        {phase === "consent" && <WebcamConsent onEnable={enableCamera} onSkip={skipCamera} />}
        {phase === "countdown" && <Countdown onComplete={() => setPhase("playing")} goLabel={t.games.faceFocus.name} />}

        {phase === "playing" && (
          <motion.div
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_24px_6px_rgba(139,92,246,0.5)]"
            animate={{ left: `${target.x}%`, top: `${target.y}%` }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            celebratory={isChild}
            stats={[{ label: t.common.score, value: result.engagementScore !== undefined ? `${result.engagementScore}%` : "—" }]}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function FaceFocusGame() {
  return (
    <RequireProfile>
      <FaceFocusContent />
    </RequireProfile>
  );
}
