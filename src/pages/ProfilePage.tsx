import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Gamepad2, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { NavBar } from "../components/layout/NavBar";
import { BottomNav } from "../components/layout/BottomNav";
import { RequireProfile } from "../components/layout/RequireProfile";
import { BackgroundOrbs } from "../components/ui/BackgroundOrbs";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { useLanguage } from "../lib/i18n/context";
import { useAppStore } from "../lib/store/useAppStore";
import { AVATARS } from "../lib/avatars";

function ProfileContent() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const profile = useAppStore((s) => s.profile);
  const history = useAppStore((s) => s.history);
  const resetAll = useAppStore((s) => s.resetAll);

  const avatar = AVATARS.find((a) => a.id === profile?.avatarId)?.emoji ?? "🌟";

  const handleReset = () => {
    if (confirm(t.settings.resetConfirm)) {
      resetAll();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="relative min-h-dvh px-5 pb-28">
      <BackgroundOrbs variant="subtle" />
      <NavBar title={t.nav.profile} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard strong className="flex flex-col items-center gap-3 py-9 text-center">
          <div className="text-6xl">{avatar}</div>
          <h2 className="text-2xl font-bold">{profile?.name}</h2>
          <p className="text-foreground/55 text-sm">{profile?.ageGroup === "child" ? t.profileSetup.childOption : t.profileSetup.adultOption}</p>
        </GlassCard>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <GlassCard className="flex flex-col items-center gap-1 py-6 text-center">
          <Calendar className="text-secondary" size={22} />
          <p className="text-xs text-foreground/50 mt-1">{t.common.appName}</p>
          <p className="font-semibold text-sm">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US") : "—"}</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center gap-1 py-6 text-center">
          <Gamepad2 className="text-primary" size={22} />
          <p className="text-xs text-foreground/50 mt-1">{t.gameHub.title}</p>
          <p className="font-semibold text-sm">{history.length}</p>
        </GlassCard>
      </div>

      <div className="mt-6 space-y-2">
        <Link to="/settings">
          <GlassCard hover className="flex items-center gap-3">
            <SettingsIcon size={18} className="text-foreground/60" />
            <span className="font-medium">{t.nav.settings}</span>
          </GlassCard>
        </Link>
      </div>

      <Button variant="danger" fullWidth className="mt-6" icon={<RotateCcw size={18} />} onClick={handleReset}>
        {t.settings.resetData}
      </Button>

      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireProfile>
      <ProfileContent />
    </RequireProfile>
  );
}
