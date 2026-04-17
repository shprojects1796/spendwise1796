import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { Insight } from "../../types";

interface InsightCardProps {
  insight: Insight;
  className?: string;
  "data-ocid"?: string;
}

const CONFIG = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    textColor: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300",
    label: "Warning",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10 border-primary/20",
    iconColor: "text-primary",
    textColor: "text-primary",
    badge: "bg-primary/20 text-primary",
    label: "Info",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300",
    label: "Healthy",
  },
};

export function InsightCard({
  insight,
  className,
  "data-ocid": dataOcid,
}: InsightCardProps) {
  const type = (
    insight.insightType in CONFIG ? insight.insightType : "info"
  ) as keyof typeof CONFIG;
  const { icon: Icon, bg, iconColor, textColor, badge, label } = CONFIG[type];

  return (
    <Card
      data-ocid={dataOcid}
      className={cn(
        "flex items-start gap-3 p-4 border transition-smooth hover:shadow-elevated",
        bg,
        className,
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0", iconColor)}>
        <Icon className="w-4.5 h-4.5" size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
              badge,
            )}
          >
            {label}
          </span>
        </div>
        <p className={cn("text-sm leading-relaxed", textColor)}>
          {insight.message}
        </p>
      </div>
    </Card>
  );
}
