import { cn } from "@/lib/utils";

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  label?: string;
  showValues?: boolean;
  className?: string;
}

export function BudgetProgressBar({
  spent,
  budget,
  label,
  showValues = true,
  className,
}: BudgetProgressBarProps) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = budget > 0 && spent > budget;

  const trackColor = isOver
    ? "bg-destructive/20"
    : pct >= 70
      ? "bg-amber-500/20"
      : "bg-emerald-500/20";

  const fillColor = isOver
    ? "bg-destructive"
    : pct >= 70
      ? "bg-amber-500"
      : "bg-emerald-500";

  const statusLabel = isOver
    ? "Over budget"
    : pct >= 70
      ? "Nearing limit"
      : "On track";
  const statusColor = isOver
    ? "text-destructive"
    : pct >= 70
      ? "text-amber-500"
      : "text-emerald-500";

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValues) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-foreground">{label}</span>
          )}
          {showValues && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-muted-foreground">
                ${spent.toFixed(2)} / ${budget.toFixed(2)}
              </span>
              <span className={cn("text-xs font-semibold", statusColor)}>
                {statusLabel}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={cn("h-2 rounded-full overflow-hidden", trackColor)}>
        <div
          className={cn("h-full rounded-full transition-smooth", fillColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {showValues && (
        <p className={cn("text-xs font-medium", statusColor)}>
          {pct.toFixed(0)}% used
          {isOver && ` — $${(spent - budget).toFixed(2)} over`}
        </p>
      )}
    </div>
  );
}
