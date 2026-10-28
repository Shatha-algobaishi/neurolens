import { useNavigate } from "react-router-dom";
import { Moon, Sun, Languages, Volume2, VolumeX, Trash2 } from "lucide-react";
import { NavBar } from "../components/layout/NavBar";
import { RequireProfile } from "../components/layout/RequireProfile";
import { BackgroundOrbs } from "../components/ui/BackgroundOrbs";
import { GlassCard } from "../components/ui/GlassCard";
import { useLanguage } from "../lib/i18n/context";
import { useTheme } from "../lib/theme/context";
import { useAppStore } from "../lib/store/useAppStore";
import { setMuted } from "../lib/sound";
import { cn } from "../lib/utils";
import type { Locale } from "../types";

function SettingsContent() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();
  const soundMuted = useAppStore((s) => s.soundMuted);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const resetAll = useAppStore((s) => s.resetAll);

  const handleReset = () => {
    if (confirm(t.settings.resetConfirm)) {
      resetAll();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="relative min-h-dvh px-5 pb-16">
      <BackgroundOrbs variant="subtle" />
      <NavBar title={t.settings.title} showBack />

      <p className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-foreground/50">{t.settings.appearance}</p>
      <GlassCard className="mb-6 flex items-center gap-2 !p-2">
        {(["dark", "light"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-colors",
              theme === mode ? "bg-gradient-to-r from-primary to-secondary text-white" : "text-foreground/60 hover:bg-foreground/8"
            )}
          >
            {mode === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            {mode === "dark" ? t.settings.dark : t.settings.light}
          </button>
        ))}
      </GlassCard>

      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">{t.settings.language}</p>
      <GlassCard className="mb-6 flex items-center gap-2 !p-2">
        {(["ar", "en"] as Locale[]).map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-colors",
              locale === loc ? "bg-gradient-to-r from-primary to-secondary text-white" : "text-foreground/60 hover:bg-foreground/8"
            )}
          >
            <Languages size={16} />
            {loc === "ar" ? "العربية" : "English"}
          </button>
        ))}
      </GlassCard>

      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">{t.settings.sound}</p>
      <GlassCard className="mb-6 flex items-center gap-2 !p-2">
        <button
          onClick={() => {
            toggleSound();
            setMuted(!soundMuted);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-foreground/70 hover:bg-foreground/8"
        >
          {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {soundMuted ? t.common.unmute : t.common.mute}
        </button>
      </GlassCard>

      <button onClick={handleReset} className="w-full text-start">
        <GlassCard hover className="flex items-center gap-3 border border-danger/20">
          <Trash2 size={18} className="text-danger" />
          <span className="flex-1 font-medium text-danger">{t.settings.resetData}</span>
        </GlassCard>
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireProfile>
      <SettingsContent />
    </RequireProfile>
  );
}
