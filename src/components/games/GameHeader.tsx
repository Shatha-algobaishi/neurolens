import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../../lib/i18n/context";
import { Chip } from "../ui/Chip";
import type { ReactNode } from "react";

export function GameHeader({ title, right }: { title: string; right?: ReactNode }) {
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={() => navigate("/games")} className="glass flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10" aria-label="Back">
        <BackIcon size={18} />
      </button>
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="min-w-10 flex justify-end">{right ?? <Chip>&nbsp;</Chip>}</div>
    </div>
  );
}
