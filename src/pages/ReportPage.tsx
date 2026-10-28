import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, ShieldAlert, Printer, Share2, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { NavBar } from "../components/layout/NavBar";
import { BottomNav } from "../components/layout/BottomNav";
import { BackgroundOrbs } from "../components/ui/BackgroundOrbs";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { ScoreBar } from "../components/ui/ScoreBar";
import { DomainRadarChart } from "../components/report/DomainRadarChart";
import { CognitiveFingerprint } from "../components/report/CognitiveFingerprint";
import { ConditionCard } from "../components/report/ConditionCard";
import { useLanguage } from "../lib/i18n/context";
import { useAppStore } from "../lib/store/useAppStore";
import { runEngine, DOMAIN_ORDER } from "../engine";
import type { ConditionIndicator, DomainScores } from "../engine/types";
import type { Profile } from "../types";
import { buildDemoGameResults, buildDemoProfile, buildDemoScaleAnswers } from "../lib/demo";
import { generateReportNarrative } from "../lib/ai/generateReport";

function ReportContent({ isFresh, isDemoRun }: { isFresh: boolean; isDemoRun: boolean }) {
  const { t, locale } = useLanguage();

  const realProfile = useAppStore((s) => s.profile);
  const gameResults = useAppStore((s) => s.gameResults);
  const scaleAnswers = useAppStore((s) => s.scaleAnswers);
  const currentDomainScores = useAppStore((s) => s.currentDomainScores);
  const currentConditions = useAppStore((s) => s.currentConditions);
  const currentReport = useAppStore((s) => s.currentReport);
  const finalizeSession = useAppStore((s) => s.finalizeSession);

  // Demo mode never reads or writes the real profile/session state — it
  // renders entirely from this local, throwaway state.
  const [demoProfile] = useState<Profile>(() => buildDemoProfile(locale));
  const displayProfile = isDemoRun ? demoProfile : realProfile;

  const [domainScores, setDomainScores] = useState<DomainScores | null>(isDemoRun ? null : currentDomainScores);
  const [conditions, setConditions] = useState<ConditionIndicator[] | null>(isDemoRun ? null : currentConditions);
  const [streamingText, setStreamingText] = useState(isDemoRun ? "" : currentReport?.narrative ?? "");
  const [generating, setGenerating] = useState(isFresh || isDemoRun);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!(isFresh || isDemoRun) || startedRef.current) return;
    if (isFresh && !realProfile) return;
    startedRef.current = true;

    const run = async () => {
      const ageGroup = isDemoRun ? demoProfile.ageGroup : realProfile!.ageGroup;
      const name = isDemoRun ? demoProfile.name : realProfile!.name;
      const results = isDemoRun ? buildDemoGameResults() : gameResults;
      const scales = isDemoRun ? buildDemoScaleAnswers() : scaleAnswers;
      const { domainScores: d, conditions: c } = runEngine({
        ageGroup,
        gameResults: results,
        scaleAnswers: scales,
      });
      setDomainScores(d);
      setConditions(c);
      setStreamingText("");

      const report = await generateReportNarrative(name, d, c, locale, {
        onDelta: (_chunk, full) => setStreamingText(full),
      });

      // Only a real (non-demo) session is persisted to history / current state.
      if (!isDemoRun) finalizeSession(d, c, report);
      setGenerating(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFresh, isDemoRun, realProfile]);

  const hasData = domainScores && conditions;

  if (!hasData) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <BackgroundOrbs />
        <Sparkles className="text-secondary" size={40} />
        <h2 className="mt-4 text-xl font-bold">{t.report.title}</h2>
        <p className="mt-2 max-w-sm text-foreground/60">{t.report.noData}</p>
        <Link to="/games">
          <Button size="lg" className="mt-6">
            {t.report.playGames}
          </Button>
        </Link>
        {!isDemoRun && <BottomNav />}
      </div>
    );
  }

  const sorted = [...DOMAIN_ORDER].sort((a, b) => domainScores[b] - domainScores[a]);
  const strongest = sorted[0];
  const growth = sorted[sorted.length - 1];

  return (
    <div className="relative min-h-dvh px-5 pb-28">
      <BackgroundOrbs variant="subtle" />
      <NavBar title={t.report.title} showBack />

      {isDemoRun && (
        <div className="mb-4 rounded-2xl bg-secondary/10 px-4 py-2.5 text-center text-xs font-medium text-secondary">{t.demo.banner}</div>
      )}

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-warning" />
        <p className="text-sm text-foreground/75">{t.report.disclaimerLine}</p>
      </motion.div>

      <GlassCard strong className="flex flex-col items-center gap-4 text-center">
        <CognitiveFingerprint scores={domainScores} />
        {generating && !streamingText ? (
          <div className="flex items-center gap-3 text-foreground/60">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}>
              <Brain size={22} className="text-primary" />
            </motion.span>
            <span className="text-sm">{t.report.generating}</span>
          </div>
        ) : (
          <p className="text-foreground/75 leading-relaxed max-w-lg">
            {streamingText}
            {generating && <span className="animate-pulse">▍</span>}
          </p>
        )}
      </GlassCard>

      <GlassCard className="mt-6">
        <h3 className="mb-2 font-semibold">{t.report.domainsTitle}</h3>
        <DomainRadarChart scores={domainScores} />
      </GlassCard>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <GlassCard className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-foreground/50">{t.report.strongest}</p>
            <p className="font-semibold text-sm">{t.domains[strongest]}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-xs text-foreground/50">{t.report.growth}</p>
            <p className="font-semibold text-sm">{t.domains[growth]}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 space-y-4">
        {DOMAIN_ORDER.map((d) => (
          <ScoreBar key={d} label={t.domains[d]} value={domainScores[d]} />
        ))}
      </GlassCard>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold">{t.report.conditionsTitle}</h3>
        <div className="space-y-2.5">
          {conditions.map((c) => (
            <ConditionCard key={c.id} indicator={c} />
          ))}
        </div>
      </div>

      <div className="no-print mt-8 flex flex-col gap-3">
        <Button size="lg" fullWidth variant="glass" icon={<Printer size={18} />} onClick={() => window.print()}>
          {t.report.print}
        </Button>
        <Button
          size="lg"
          fullWidth
          variant="glass"
          icon={<Share2 size={18} />}
          onClick={() => {
            const text = `${t.common.appName} — ${displayProfile?.name}: ${t.report.strongest} ${t.domains[strongest]}`;
            if (navigator.share) navigator.share({ title: t.common.appName, text }).catch(() => {});
            else navigator.clipboard?.writeText(text);
          }}
        >
          {t.report.share}
        </Button>
      </div>

      {!isDemoRun && <BottomNav />}
    </div>
  );
}

export default function ReportPage() {
  const [params] = useSearchParams();
  const isFresh = params.get("fresh") === "1";
  const isDemoRun = params.get("demo") === "1";
  const navigate = useNavigate();

  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const profile = useAppStore((s) => s.profile);

  useEffect(() => {
    if (hasHydrated && !profile && !isDemoRun) {
      navigate("/", { replace: true });
    }
  }, [hasHydrated, profile, isDemoRun, navigate]);

  if (!hasHydrated || (!profile && !isDemoRun)) {
    return <div className="min-h-dvh bg-background" />;
  }

  return <ReportContent isFresh={isFresh} isDemoRun={isDemoRun} />;
}
