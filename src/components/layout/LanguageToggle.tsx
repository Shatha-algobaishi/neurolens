import { motion } from "framer-motion";
import { useLanguage } from "../../lib/i18n/context";
import { cn } from "../../lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <div className={cn("relative flex h-10 w-20 items-center rounded-full glass p-1", className)}>
      <button
        onClick={() => setLocale("ar")}
        className="relative z-10 grid h-full flex-1 place-items-center rounded-full"
        aria-label="العربية"
      >
        {isAr && (
          <motion.span
            layoutId="lang-pill"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary shadow-md"
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}
        <span className={cn("relative text-[11px] font-bold transition-colors", isAr ? "text-white" : "text-foreground/50")}>ع</span>
      </button>
      <button
        onClick={() => setLocale("en")}
        className="relative z-10 grid h-full flex-1 place-items-center rounded-full"
        aria-label="English"
      >
        {!isAr && (
          <motion.span
            layoutId="lang-pill"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary shadow-md"
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}
        <span className={cn("relative text-[11px] font-bold transition-colors", !isAr ? "text-white" : "text-foreground/50")}>EN</span>
      </button>
    </div>
  );
}
