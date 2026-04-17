import {
  AlertTriangle,
  CheckCircle,
  Edit2,
  PiggyBank,
  Save,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { BudgetProgressBar } from "@/components/ui/BudgetProgressBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "../store/useStore";
import { CATEGORIES, CATEGORY_COLORS } from "../types";

const fmt = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

function BudgetSetupCard() {
  const { budget, setBudget } = useStore();
  const [editing, setEditing] = useState(budget === 0);
  const [value, setValue] = useState(budget > 0 ? String(budget) : "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setBudget(parsed);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditing(false);
      setValue(String(budget));
    }
  };

  if (!editing && budget > 0) {
    return (
      <Card
        className="border-border relative overflow-hidden"
        data-ocid="budget.setup.card"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-primary" />
              Monthly Budget
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(true);
                setValue(String(budget));
              }}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              data-ocid="budget.edit_button"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-display font-bold text-foreground tracking-tight">
              {fmt(budget)}
            </span>
            <span className="text-muted-foreground mb-1.5 text-sm">
              / month
            </span>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-sm text-emerald-600"
              data-ocid="budget.success_state"
            >
              <CheckCircle className="w-4 h-4" />
              Budget saved successfully!
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-primary/30 relative overflow-hidden"
      data-ocid="budget.setup.card"
    >
      <div className="absolute inset-0 gradient-primary opacity-5 pointer-events-none" />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-primary" />
          {budget === 0 ? "Set Your Monthly Budget" : "Edit Monthly Budget"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Define how much you plan to spend each month. We'll track your
          progress and alert you when you're nearing the limit.
        </p>
        <div className="space-y-2">
          <Label htmlFor="budget-input" className="text-sm font-medium">
            Monthly Budget Amount (₹)
          </Label>
          <div className="flex gap-3">
            <Input
              id="budget-input"
              type="number"
              min={1}
              step={50}
              placeholder="e.g. 3000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-w-xs text-lg font-semibold"
              data-ocid="budget.input"
            />
            <Button
              onClick={handleSave}
              className="gap-2 shrink-0"
              data-ocid="budget.save_button"
            >
              <Save className="w-4 h-4" />
              Save Budget
            </Button>
            {budget > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(false);
                  setValue(String(budget));
                }}
                data-ocid="budget.cancel_button"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-600"
            data-ocid="budget.success_state"
          >
            <CheckCircle className="w-4 h-4" />
            Budget saved successfully!
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetStatusCard() {
  const { budget, getMonthlySpending } = useStore();
  const spent = getMonthlySpending();
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;

  const status = pct > 100 ? "exceeded" : pct >= 70 ? "warning" : "safe";

  const statusConfig = {
    safe: {
      label: "Safe",
      icon: <CheckCircle className="w-4 h-4" />,
      badgeClass: "bg-emerald-500/15 text-emerald-600 border-emerald-500/40",
      msg: `You've used ${pct.toFixed(0)}% of your monthly budget`,
    },
    warning: {
      label: "Warning",
      icon: <AlertTriangle className="w-4 h-4" />,
      badgeClass: "bg-amber-500/15 text-amber-600 border-amber-500/40",
      msg: `You've used ${pct.toFixed(0)}% of your monthly budget — nearing the limit`,
    },
    exceeded: {
      label: "Exceeded",
      icon: <XCircle className="w-4 h-4" />,
      badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
      msg: `You've exceeded your budget by ${fmt(spent - budget)}`,
    },
  }[status];

  return (
    <Card className="border-border" data-ocid="budget.status.card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Budget Status</CardTitle>
          <Badge
            variant="outline"
            className={`gap-1.5 text-xs font-semibold px-2.5 py-1 ${statusConfig.badgeClass}`}
            data-ocid="budget.status.toggle"
          >
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {budget === 0 ? (
          <p className="text-sm text-muted-foreground">
            Set a monthly budget above to see your progress here.
          </p>
        ) : (
          <>
            <BudgetProgressBar
              spent={spent}
              budget={budget}
              showValues={false}
              className="[&_.h-2]:h-3"
            />
            <p className="text-sm text-muted-foreground">{statusConfig.msg}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Spent
                </p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {fmt(spent)}
                </p>
              </div>
              <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Remaining
                </p>
                <p
                  className={`text-2xl font-display font-bold ${
                    remaining < 0 ? "text-destructive" : "text-emerald-600"
                  }`}
                >
                  {remaining < 0
                    ? `-${fmt(Math.abs(remaining))}`
                    : fmt(remaining)}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface GaugePoint {
  name: string;
  value: number;
  fill: string;
}

function PredictionCard() {
  const { budget, getPredictNextMonth, expenses } = useStore();
  const predicted = getPredictNextMonth();
  const hasData = expenses.length >= 2;
  const diff = predicted - budget;
  const overBudget = budget > 0 && diff > 0;

  const gaugeData: GaugePoint[] = [
    {
      name: "Predicted",
      value:
        hasData && budget > 0 ? Math.min((predicted / budget) * 100, 130) : 0,
      fill: overBudget ? "oklch(var(--destructive))" : "oklch(var(--primary))",
    },
  ];

  return (
    <Card className="border-border" data-ocid="budget.prediction.card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Next Month Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex flex-col items-center justify-center py-8 gap-3 text-center"
            data-ocid="budget.prediction.empty_state"
          >
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add more expenses to see next month's spending prediction based on
              your trends.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-28 h-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="100%"
                    startAngle={225}
                    endAngle={-45}
                    data={gaugeData}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={6}
                      background={{ fill: "oklch(var(--muted))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                        borderRadius: "8px",
                        color: "oklch(var(--foreground))",
                        fontSize: "12px",
                      }}
                      formatter={(v: number) => [
                        `${v.toFixed(0)}%`,
                        "Forecast vs Budget",
                      ]}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 pt-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Predicted Spend
                </p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {fmt(predicted)}
                </p>
                {budget > 0 && (
                  <p
                    className={`text-sm font-medium ${
                      overBudget ? "text-destructive" : "text-emerald-600"
                    }`}
                  >
                    {overBudget
                      ? `${fmt(diff)} over budget`
                      : `${fmt(Math.abs(diff))} under budget`}
                  </p>
                )}
              </div>
            </div>

            {overBudget && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3"
                data-ocid="budget.prediction.error_state"
              >
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">
                  You're projected to exceed your budget by{" "}
                  <strong>{fmt(diff)}</strong> next month. Consider reducing
                  spending in your top categories.
                </p>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SpendingBreakdownCard() {
  const { budget, getCategoryBreakdown, getMonthlySpending } = useStore();
  const breakdown = getCategoryBreakdown();
  const monthlySpent = getMonthlySpending();

  const rows = CATEGORIES.map((cat) => {
    const key = cat.toLowerCase() as keyof typeof breakdown;
    const spent = breakdown[key] ?? 0;
    const pct = budget > 0 ? (spent / budget) * 100 : 0;
    const ofMonth = monthlySpent > 0 ? (spent / monthlySpent) * 100 : 0;
    const color = CATEGORY_COLORS[cat];
    return { cat, spent, pct, ofMonth, color };
  }).filter((r) => r.spent > 0);

  return (
    <Card className="border-border" data-ocid="budget.breakdown.card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display">
          Spending Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div
            className="py-8 text-center space-y-2"
            data-ocid="budget.breakdown.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No expenses this month yet. Add expenses to see your category
              breakdown.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((r, i) => {
              const barPct = budget > 0 ? r.pct : r.ofMonth;
              const exceeded = budget > 0 && r.spent > budget * 0.5;
              return (
                <div
                  key={r.cat}
                  className="space-y-1.5"
                  data-ocid={`budget.breakdown.item.${i + 1}`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: r.color }}
                      />
                      <span className="font-medium text-foreground">
                        {r.cat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        {fmt(r.spent)}
                      </span>
                      {budget > 0 && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0.5 ${
                            exceeded
                              ? "border-destructive/40 text-destructive bg-destructive/10"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {r.pct.toFixed(0)}% of budget
                        </Badge>
                      )}
                      {budget === 0 && (
                        <span className="text-muted-foreground">
                          {r.ofMonth.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-muted/60">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: r.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(barPct, 100)}%` }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.06,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {rows.length > 0 && budget > 0 && (
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Total categories tracked: {rows.length}</span>
                <span>
                  {((monthlySpent / budget) * 100).toFixed(0)}% of monthly
                  budget used
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BudgetPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6" data-ocid="budget.page">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          Budget Settings & Predictions
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your monthly budget, track progress, and see AI-powered
          forecasts.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <BudgetSetupCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <BudgetStatusCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.19 }}
        >
          <PredictionCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.26 }}
        >
          <SpendingBreakdownCard />
        </motion.div>
      </div>
    </div>
  );
}
