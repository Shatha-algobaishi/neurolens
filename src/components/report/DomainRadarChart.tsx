import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { DOMAIN_ORDER } from "../../engine/scoring";
import type { DomainScores } from "../../engine/types";
import { useLanguage } from "../../lib/i18n/context";

export function DomainRadarChart({ scores }: { scores: DomainScores }) {
  const { t } = useLanguage();
  const data = DOMAIN_ORDER.map((d) => ({ domain: t.domains[d], value: scores[d] }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="currentColor" strokeOpacity={0.12} />
          <PolarAngleAxis dataKey="domain" tick={{ fill: "currentColor", fontSize: 11, opacity: 0.75 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#2DD4BF"
            fill="#8B5CF6"
            fillOpacity={0.35}
            strokeWidth={2}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
