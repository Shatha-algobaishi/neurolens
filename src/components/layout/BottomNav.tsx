import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, Sparkles, User } from "lucide-react";
import { useLanguage } from "../../lib/i18n/context";
import { cn } from "../../lib/utils";

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const items = [
    { href: "/home", label: t.nav.home, icon: Home },
    { href: "/games", label: t.nav.games, icon: Gamepad2 },
    { href: "/report", label: t.nav.report, icon: Sparkles },
    { href: "/profile", label: t.nav.profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,28rem)] -translate-x-1/2">
      <div className="glass-strong flex items-center justify-between rounded-3xl px-2 py-2 shadow-2xl">
        {items.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors",
                active ? "text-white" : "text-foreground/55 hover:text-foreground"
              )}
            >
              {active && <span className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary to-secondary" />}
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
