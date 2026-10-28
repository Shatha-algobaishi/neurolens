import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ThemeMode } from "../../types";

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "neurolens-v2-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    // NeuroLens is dark-first by design — we never fall back to the OS
    // color-scheme preference. Dark is always the default first impression
    // unless the user explicitly picked light before.
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark") setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
