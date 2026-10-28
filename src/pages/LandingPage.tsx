import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, PlayCircle, Gamepad2, BrainCircuit, ShieldAlert, Zap, Users, BookOpen, Calculator, Wind, CloudRain } from "lucide-react";
import { NavBar } from "../components/layout/NavBar";
import { BackgroundOrbs } from "../components/ui/BackgroundOrbs";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedCounter } from "../components/landing/AnimatedCounter";
import { ParticleBrainHero } from "../components/landing/ParticleBrainHero";
import { ConditionFlipCard } from "../components/landing/ConditionFlipCard";
import { useLanguage } from "../lib/i18n/context";
import { useAppStore } from "../lib/store/useAppStore";

const CONDITION_ICONS = { adhd: Zap, asd: Users, dyslexia: BookOpen, dyscalculia: Calculator, anxiety: Wind, depression: CloudRain, mci: BrainCircuit };
const CONDITION_GRADIENTS: Record<string, string> = {
  adhd: "from-yellow-400 to-orange-500",
  asd: "from-primary to-secondary",
  dyslexia: "from-blue-400 to-cyan-500",
  dyscalculia: "from-emerald-400 to-teal-500",
  anxiety: "from-violet-400 to-purple-500",
  depression: "from-slate-400 to-slate-600",
  mci: "from-secondary to-accent",
};
const CONDITION_ORDER = ["adhd", "asd", "dyslexia", "dyscalculia", "anxiety", "depression", "mci"] as const;

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const profile = useAppStore((s) => s.profile);

  const handleStart = () => {
    navigate(profile ? "/games" : "/profile-setup");
  };

  const handleDemo = () => {
    // Demo mode never touches the user's real profile/store — the report
    // page computes and displays everything locally when it sees ?demo=1.
    navigate("/report?demo=1");
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <BackgroundOrbs />
      <div className="px-5">
        <NavBar />
      </div>

      {/* Hero */}
      <section className="relative flex min-h-[86dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <ParticleBrainHero className="absolute inset-0 h-full w-full" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-2xl">
          <h1 className="gradient-text text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">{t.landing.heroTitle}</h1>
          <p className="mt-5 text-lg text-foreground/70 leading-relaxed">{t.landing.heroSubtitle}</p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" icon={<Sparkles size={20} />} onClick={handleStart}>
              {t.landing.ctaStart}
            </Button>
            <Button size="lg" variant="glass" icon={<PlayCircle size={20} />} onClick={handleDemo}>
              {t.landing.ctaDemo}
            </Button>
          </div>
        </motion.div>

        <div className="relative z-10 mt-16 grid grid-cols-3 gap-6 sm:gap-14">
          {[
            { value: 10, suffix: "+", label: t.landing.statDomains },
            { value: 15, suffix: "", label: t.landing.statGames },
            { value: 7, suffix: "", label: t.landing.statConditions },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-foreground/55">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="text-center mb-14">
          <h2 className="text-3xl font-bold">{t.landing.howTitle}</h2>
          <p className="mt-2 text-foreground/60">{t.landing.howSubtitle}</p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Gamepad2, title: t.landing.step1Title, body: t.landing.step1Body },
            { icon: BrainCircuit, title: t.landing.step2Title, body: t.landing.step2Body },
            { icon: Sparkles, title: t.landing.step3Title, body: t.landing.step3Body },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12 }}
            >
              <GlassCard className="h-full flex flex-col items-center text-center gap-4 py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                  <step.icon size={26} />
                </div>
                <span className="text-xs font-bold text-secondary">0{i + 1}</span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{step.body}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Conditions covered */}
      <section className="relative mx-auto max-w-5xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="text-center mb-10">
          <h2 className="text-3xl font-bold">{t.landing.conditionsTitle}</h2>
          <p className="mt-2 text-foreground/60">{t.landing.conditionsSubtitle}</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CONDITION_ORDER.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06 }}
            >
              <ConditionFlipCard icon={CONDITION_ICONS[id]} name={t.conditions[id].name} blurb={t.conditions[id].blurb} gradient={CONDITION_GRADIENTS[id]} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="relative mx-auto max-w-3xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}>
          <GlassCard strong className="border border-warning/25 flex items-start gap-4">
            <ShieldAlert size={26} className="mt-1 shrink-0 text-warning" />
            <div>
              <h3 className="font-semibold text-warning mb-1.5">{t.landing.disclaimerTitle}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">{t.landing.disclaimerBody}</p>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Floating CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
        <Button size="lg" icon={<Sparkles size={18} />} onClick={handleStart} className="shadow-2xl">
          {t.landing.floatingCta}
        </Button>
      </motion.div>
    </div>
  );
}
