import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, User } from "lucide-react";
import { NavBar } from "../components/layout/NavBar";
import { BackgroundOrbs } from "../components/ui/BackgroundOrbs";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { useLanguage } from "../lib/i18n/context";
import { useAppStore } from "../lib/store/useAppStore";
import { AVATARS } from "../lib/avatars";
import { cn } from "../lib/utils";
import type { AgeGroup } from "../types";

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const setProfile = useAppStore((s) => s.setProfile);

  const [step, setStep] = useState<"age" | "details">("age");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);

  const chooseAge = (group: AgeGroup) => {
    setAgeGroup(group);
    setStep("details");
  };

  const createProfile = () => {
    setProfile({ name: name.trim() || (ageGroup === "child" ? t.profileSetup.childOption : t.profileSetup.adultOption), ageGroup, avatarId, createdAt: new Date().toISOString() });
    navigate("/home");
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden px-6">
      <BackgroundOrbs />
      <NavBar showBack />

      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {step === "age" && (
            <motion.div key="age" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="w-full max-w-md text-center">
              <h2 className="text-2xl font-bold">{t.profileSetup.title}</h2>
              <p className="mt-2 text-foreground/60">{t.profileSetup.subtitle}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <GlassCard hover onClick={() => chooseAge("child")} className="flex flex-col items-center gap-3 py-10">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity }} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                    <Baby size={30} />
                  </motion.div>
                  <span className="font-semibold">{t.profileSetup.childOption}</span>
                  <span className="text-xs text-foreground/50">{t.profileSetup.childRange}</span>
                </GlassCard>
                <GlassCard hover onClick={() => chooseAge("adult")} className="flex flex-col items-center gap-3 py-10">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.3 }} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white">
                    <User size={30} />
                  </motion.div>
                  <span className="font-semibold">{t.profileSetup.adultOption}</span>
                  <span className="text-xs text-foreground/50">{t.profileSetup.adultRange}</span>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="w-full max-w-md">
              <GlassCard strong className="flex flex-col items-center gap-5 py-9 text-center">
                <div className="text-6xl">{AVATARS.find((a) => a.id === avatarId)?.emoji}</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.profileSetup.namePlaceholder}
                  className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3.5 text-center outline-none ring-primary/40 transition focus:ring-2"
                />
                <div className="w-full">
                  <p className="mb-2 text-sm font-medium text-foreground/60">{t.profileSetup.avatarPick}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAvatarId(a.id)}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all",
                          avatarId === a.id ? "bg-gradient-to-br from-primary to-secondary scale-110 shadow-lg" : "bg-foreground/8 hover:bg-foreground/15"
                        )}
                      >
                        {a.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="lg" fullWidth onClick={createProfile}>
                  {t.profileSetup.createProfile}
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
