import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, ArrowRight, Zap } from "lucide-react";
import { NavBar } from "../components/layout/NavBar";
import { BottomNav } from "../components/layout/BottomNav";
import { RequireProfile } from "../components/layout/RequireProfile";
import { BackgroundOrbs } from "../components/ui/BackgroundOrbs";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { ProgressRing } from "../components/ui/ProgressRing";
import { useLanguage } from "../lib/i18n/context";
import { useAppStore } from "../lib/store/useAppStore";
import { gamesFor } from "../lib/gamesMeta";
import { cn } from "../lib/utils";

const XP_PER_GAME = 100;

function GameHubContent() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const profile = useAppStore((s) => s.profile);
  const gameResults = useAppStore((s) => s.gameResults);

  const ageGroup = profile?.ageGroup ?? "adult";
  const games = gamesFor(ageGroup);
  const completedIds = new Set(gameResults.map((g) => g.gameId));
  const completedCount = games.filter((g) => completedIds.has(g.id)).length;
  const totalXp = completedCount * XP_PER_GAME;
  const maxXp = games.length * XP_PER_GAME;
  const level = Math.floor(totalXp / 300) + 1;

  return (
    <div className="relative min-h-dvh px-5 pb-40">
      <BackgroundOrbs variant="subtle" />
      <NavBar title={t.gameHub.title} />
      <p className="text-foreground/60 mb-4 max-w-md">{t.gameHub.subtitle}</p>

      <GlassCard strong className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-warning to-accent text-white">
          <Zap size={22} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-semibold">
              {t.gameHub.xp} · {t.common.level} {level}
            </span>
            <span className="text-foreground/50">
              {totalXp}/{maxXp}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-warning via-accent to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${(totalXp / maxXp) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map(({ id, path, icon: Icon, gradient }, i) => {
          const done = completedIds.has(id);
          const unlocked = i === 0 || completedIds.has(games[i - 1].id) || done;
          const CardInner = (
            <GlassCard hover={unlocked} className={cn("relative flex items-center gap-4 overflow-hidden", !unlocked && "opacity-50")}>
              <div className="relative">
                <ProgressRing value={done ? 100 : 0} size={56} strokeWidth={5} colorFrom={done ? "#22D3EE" : "#8B5CF6"} colorTo={done ? "#2DD4BF" : "#2DD4BF"} />
                <div className={`absolute inset-1.5 flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white`}>
                  {unlocked ? <Icon size={20} /> : <Lock size={18} />}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{t.games[id].name}</h3>
                  {done && <CheckCircle2 size={16} className="text-accent shrink-0" />}
                </div>
                <p className="text-sm text-foreground/60 truncate">{t.games[id].description}</p>
              </div>
            </GlassCard>
          );
          return (
            <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              {unlocked ? <Link to={path}>{CardInner}</Link> : CardInner}
            </motion.div>
          );
        })}
      </div>

      {completedCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-24 left-1/2 z-30 w-[min(92vw,26rem)] -translate-x-1/2">
          <Button fullWidth size="lg" iconEnd={<ArrowRight size={20} />} onClick={() => navigate("/report?fresh=1")}>
            {t.gameHub.continueToReport}
          </Button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}

export default function GameHubPage() {
  return (
    <RequireProfile>
      <GameHubContent />
    </RequireProfile>
  );
}
