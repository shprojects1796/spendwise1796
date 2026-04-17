import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: number; // percentage change
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "gradient" | "accent";
  className?: string;
  "data-ocid"?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  variant = "default",
  className,
  "data-ocid": dataOcid,
}: MetricCardProps) {
  const hasTrend = trend !== undefined;
  const trendUp = (trend ?? 0) > 0;
  const trendFlat = (trend ?? 0) === 0;

  return (
    <Card
      data-ocid={dataOcid}
      className={cn(
        "p-5 border border-border relative overflow-hidden transition-smooth hover:shadow-elevated hover:-translate-y-0.5",
        variant === "gradient" && "gradient-primary border-0 text-white",
        variant === "accent" && "gradient-accent border-0 text-white",
        className,
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-widest",
              variant === "default" ? "text-muted-foreground" : "text-white/70",
            )}
          >
            {label}
          </p>
          {icon && (
            <div
              className={cn(
                "p-2 rounded-lg flex-shrink-0",
                variant === "default"
                  ? "bg-primary/10 text-primary"
                  : "bg-white/15 text-white",
              )}
            >
              {icon}
            </div>
          )}
        </div>

        <p
          className={cn(
            "text-2xl font-display font-bold mt-2 tracking-tight",
            variant === "default" ? "text-foreground" : "text-white",
          )}
        >
          {value}
        </p>

        {hasTrend && (
          <div className="flex items-center gap-1.5 mt-2">
            {trendFlat ? (
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
            ) : trendUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                trendFlat
                  ? variant === "default"
                    ? "text-muted-foreground"
                    : "text-white/60"
                  : trendUp
                    ? "text-emerald-400"
                    : "text-red-400",
              )}
            >
              {trendFlat
                ? "No change"
                : `${trendUp ? "+" : ""}${trend?.toFixed(1)}%`}
            </span>
            {trendLabel && (
              <span
                className={cn(
                  "text-xs",
                  variant === "default"
                    ? "text-muted-foreground"
                    : "text-white/60",
                )}
              >
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
