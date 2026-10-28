import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Sparkles, ClipboardList } from "lucide-react";
import { NavBar } from "../components/layout/NavBar";
import { BottomNav } from "../components/layout/BottomNav";
import { RequireProfile } from "../components/layout/RequireProfile";
import { BackgroundOrbs } from "../components/ui/BackgroundOrbs";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { ScoreBar } from "../components/ui/ScoreBar";
import { useLanguage } from "../lib/i18n/context";
import { useAppStore } from "../lib/store/useAppStore";
import { AVATARS } from "../lib/avatars";
import { DOMAIN_ORDER } from "../engine/scoring";

function HomeContent() {
  const { t } = useLanguage();
  const profile = useAppStore((s) => s.profile);
  const currentDomainScores = useAppStore((s) => s.currentDomainScores);
  const gameResults = useAppStore((s) => s.gameResults);

  const avatar = AVATARS.find((a) => a.id === profile?.avatarId)?.emoji ?? "🌟";

  return (
    <div className="relative min-h-dvh px-5 pb-28">
      <BackgroundOrbs variant="subtle" />
      <NavBar />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <span className="text-4xl">{avatar}</span>
        <div>
          <p className="text-foreground/60 text-sm">{t.common.tagline}</p>
          <h1 className="text-2xl font-bold">{profile?.name}</h1>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
        <GlassCard strong className="relative overflow-hidden">
          <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <Sparkles className="text-secondary" size={22} />
          <h2 className="mt-3 text-xl font-bold">{t.gameHub.title}</h2>
          <p className="mt-2 text-foreground/65">{t.gameHub.subtitle}</p>
          <Link to="/games">
            <Button size="lg" className="mt-5" icon={<Gamepad2 size={18} />}>
              {t.gameHub.play}
            </Button>
          </Link>
        </GlassCard>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <Link to="/games">
          <GlassCard hover className="flex flex-col items-center gap-2 py-6 text-center">
            <Gamepad2 className="text-primary" size={22} />
            <span className="text-xs font-medium">{t.nav.games}</span>
          </GlassCard>
        </Link>
        <Link to="/report">
          <GlassCard hover className="flex flex-col items-center gap-2 py-6 text-center">
            <ClipboardList className="text-secondary" size={22} />
            <span className="text-xs font-medium">{t.nav.report}</span>
          </GlassCard>
        </Link>
      </div>

      <div className="mt-8 pb-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">{t.report.domainsTitle}</h3>
        <GlassCard className="space-y-4">
          {currentDomainScores ? (
            DOMAIN_ORDER.slice(0, 4).map((d) => <ScoreBar key={d} label={t.domains[d]} value={currentDomainScores[d]} />)
          ) : (
            <p className="py-4 text-center text-sm text-foreground/50">{t.report.noData}</p>
          )}
        </GlassCard>
        {gameResults.length > 0 && <p className="mt-3 text-center text-xs text-foreground/40">{gameResults.length} / 12</p>}
      </div>

      <BottomNav />
    </div>
  );
}

export default function HomePage() {
  return (
    <RequireProfile>
      <HomeContent />
    </RequireProfile>
  );
}
