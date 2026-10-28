import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";
import { BackgroundOrbs } from "../../components/ui/BackgroundOrbs";
import { GameHeader } from "../../components/games/GameHeader";
import { InstructionsCard } from "../../components/games/InstructionsCard";
import { Countdown } from "../../components/games/Countdown";
import { CompleteOverlay } from "../../components/games/CompleteOverlay";
import { VoiceConsent } from "../../components/games/VoiceConsent";
import { RequireProfile } from "../../components/layout/RequireProfile";
import { Chip } from "../../components/ui/Chip";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { analyzeVoiceSample } from "../../lib/voice/voiceAnalyzer";
import { clamp } from "../../lib/utils";

const WORDS = {
  ar: ["مرحباً", "سعيد", "مدرسة", "تفاحة"],
  en: ["hello", "happy", "school", "apple"],
};
const TOTAL_ROUNDS = 3;

type Phase = "instructions" | "consent" | "countdown" | "round" | "recording" | "analyzing" | "complete";

function VoiceEchoContent() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const addGameResult = useAppStore((s) => s.addGameResult);
  const profile = useAppStore((s) => s.profile);
  const isChild = profile?.ageGroup !== "adult";
  const words = WORDS[locale];

  const [phase, setPhase] = useState<Phase>("instructions");
  const [roundNum, setRoundNum] = useState(0);
  const [result, setResult] = useState({ voiceFluency: 0 });

  const streamRef = useRef<MediaStream | null>(null);
  const scoresRef = useRef<number[]>([]);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback(
    (scores: number[]) => {
      const voiceFluency = scores.length ? clamp(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)) : undefined;
      addGameResult({
        gameId: "voiceEcho",
        completedAt: new Date().toISOString(),
        metrics: voiceFluency !== undefined ? { voiceFluency } : {},
      });
      setResult({ voiceFluency: voiceFluency ?? 0 });
      cleanup();
      setPhase("complete");
    },
    [addGameResult, cleanup]
  );

  const startGame = () => setPhase("consent");

  const enableMic = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      streamRef.current = null;
    }
    scoresRef.current = [];
    setRoundNum(0);
    setPhase("countdown");
  };

  const skipMic = () => {
    scoresRef.current = [];
    finish([]);
  };

  const record = async () => {
    if (!streamRef.current) return;
    setPhase("recording");
    const score = await analyzeVoiceSample(streamRef.current);
    setPhase("analyzing");
    scoresRef.current.push(score);
    setTimeout(() => {
      const next = roundNum + 1;
      if (next >= TOTAL_ROUNDS) {
        finish(scoresRef.current);
      } else {
        setRoundNum(next);
        setPhase("round");
      }
    }, 500);
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-6">
      <BackgroundOrbs variant="subtle" />
      <GameHeader title={t.games.voiceEcho.name} right={phase === "round" || phase === "recording" ? <Chip tone="info">{roundNum + 1}/{TOTAL_ROUNDS}</Chip> : undefined} />

      <div className="relative flex-1 rounded-3xl glass overflow-hidden min-h-[60vh] flex items-center justify-center px-4">
        {phase === "instructions" && (
          <InstructionsCard icon={<Mic size={34} />} name={t.games.voiceEcho.name} instructions={t.games.voiceEcho.instructions} measures={t.games.voiceEcho.measures} onStart={startGame} />
        )}

        {phase === "consent" && <VoiceConsent onEnable={enableMic} onSkip={skipMic} />}

        {phase === "countdown" && <Countdown onComplete={() => setPhase("round")} goLabel={t.games.voiceEcho.name} />}

        {(phase === "round" || phase === "recording" || phase === "analyzing") && (
          <motion.div key={roundNum} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-8">
            <Volume2 className="text-secondary" size={28} />
            <span className="text-4xl font-black gradient-text">{words[roundNum % words.length]}</span>
            {phase === "round" && (
              <button
                onClick={record}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-xl animate-pulse-ring"
              >
                <Mic size={30} />
              </button>
            )}
            {phase === "recording" && (
              <div className="flex h-16 items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-primary to-secondary" animate={{ height: [8, 30, 8] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }} />
                ))}
              </div>
            )}
            <p className="text-xs text-foreground/50">{phase === "recording" ? t.voice.recording : phase === "analyzing" ? t.voice.analyzing : t.voice.tapToRecord}</p>
          </motion.div>
        )}

        {phase === "complete" && (
          <CompleteOverlay
            title={t.common.roundComplete}
            celebratory={isChild}
            stats={[{ label: t.common.score, value: result.voiceFluency ? `${result.voiceFluency}%` : "—" }]}
            onBackToHub={() => navigate("/games")}
            backLabel={t.gameHub.title}
          />
        )}
      </div>
    </div>
  );
}

export default function VoiceEchoGame() {
  return (
    <RequireProfile>
      <VoiceEchoContent />
    </RequireProfile>
  );
}
