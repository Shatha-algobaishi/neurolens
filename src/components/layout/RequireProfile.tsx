import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../lib/store/useAppStore";
import type { ReactNode } from "react";

export function RequireProfile({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const profile = useAppStore((s) => s.profile);

  useEffect(() => {
    if (hasHydrated && !profile) {
      navigate("/", { replace: true });
    }
  }, [hasHydrated, profile, navigate]);

  if (!hasHydrated || !profile) {
    return <div className="min-h-dvh bg-background" />;
  }

  return <>{children}</>;
}
