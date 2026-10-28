import { Link, useNavigate } from "react-router-dom";
import { Brain, Moon, Sun, Volume2, VolumeX, ArrowLeft, ArrowRight } from "lucide-react";
import { useTheme } from "../../lib/theme/context";
import { useLanguage } from "../../lib/i18n/context";
import { useAppStore } from "../../lib/store/useAppStore";
import { setMuted } from "../../lib/sound";
import { LanguageToggle } from "./LanguageToggle";

export function NavBar({ title, showBack = false }: { title?: string; showBack?: boolean }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, dir } = useLanguage();
  const soundMuted = useAppStore((s) => s.soundMuted);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  const handleToggleSound = () => {
    toggleSound();
    setMuted(!soundMuted);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="glass flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Back"
          >
            <BackIcon size={18} />
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
              <Brain size={18} />
            </div>
            <span className="font-bold tracking-tight hidden sm:inline">{t.common.appName}</span>
          </Link>
        )}
        {title && <h1 className="text-lg font-semibold tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleSound}
          className="glass flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label={soundMuted ? t.common.unmute : t.common.mute}
        >
          {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          onClick={toggleTheme}
          className="glass flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <LanguageToggle />
      </div>
    </div>
  );
}
