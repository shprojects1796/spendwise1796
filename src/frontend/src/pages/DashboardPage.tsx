import { BudgetProgressBar } from "@/components/ui/BudgetProgressBar";
import { InsightCard } from "@/components/ui/InsightCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Lightbulb,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "../store/useStore";
import { CATEGORY_COLORS } from "../types";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const SUGGESTION_ICONS = [Lightbulb, Sparkles, Trophy, TrendingUp, Target];

export default function DashboardPage() {
  const expenses = useStore((s) => s.expenses);
  const budget = useStore((s) => s.budget);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const getTotalSpending = useStore((s) => s.getTotalSpending);
  const getMonthlySpending = useStore((s) => s.getMonthlySpending);
  const getWeeklyTrend = useStore((s) => s.getWeeklyTrend);
  const getPredictNextMonth = useStore((s) => s.getPredictNextMonth);
  const getInsights = useStore((s) => s.getInsights);
  const getSuggestions = useStore((s) => s.getSuggestions);

  const totalSpending = useMemo(() => getTotalSpending(), [getTotalSpending]);
  const monthlySpending = useMemo(
    () => getMonthlySpending(),
    [getMonthlySpending],
  );
  const weeklyTrend = useMemo(() => getWeeklyTrend(), [getWeeklyTrend]);
  const prediction = useMemo(
    () => getPredictNextMonth(),
    [getPredictNextMonth],
  );
  const insights = useMemo(() => getInsights(), [getInsights]);
  const suggestions = useMemo(() => getSuggestions(), [getSuggestions]);

  // Pie chart data: category breakdown
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Bar chart: daily spending last 30 days
  const barData = useMemo(() => {
    const today = new Date();
    const days: { date: string; label: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        label: i % 5 === 0 ? fmtDate(dateStr) : "",
        amount: 0,
      });
    }
    for (const e of expenses) {
      const idx = days.findIndex((d) => d.date === e.date);
      if (idx !== -1) days[idx].amount += e.amount;
    }
    return days;
  }, [expenses]);

  // Top spending category
  const topCategory = useMemo(() => {
    if (pieData.length === 0) return null;
    return pieData.reduce((a, b) => (a.value > b.value ? a : b));
  }, [pieData]);

  // Recent 5 expenses
  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  const budgetPct = budget > 0 ? (monthlySpending / budget) * 100 : 0;

  return (
    <div
      className="p-6 space-y-6 max-w-[1400px] mx-auto"
      data-ocid="dashboard.page"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Your financial overview at a glance
          </p>
        </div>
        {topCategory && (
          <Badge
            className="px-3 py-1.5 text-sm font-semibold rounded-full border-0"
            style={{
              backgroundColor: `${CATEGORY_COLORS[topCategory.name]}22`,
              color: CATEGORY_COLORS[topCategory.name],
            }}
          >
            🏆 Top: {topCategory.name} · {fmt(topCategory.value)}
          </Badge>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          data-ocid="dashboard.total_spending.card"
          label="Total Spending"
          value={fmt(totalSpending)}
          icon={<DollarSign className="w-4 h-4" />}
          variant="gradient"
        />
        <MetricCard
          data-ocid="dashboard.monthly_spending.card"
          label="Monthly Spending"
          value={fmt(monthlySpending)}
          icon={<Calendar className="w-4 h-4" />}
          variant="accent"
        />
        <MetricCard
          data-ocid="dashboard.weekly_trend.card"
          label="Weekly Trend"
          value={fmt(weeklyTrend.currentWeekTotal)}
          trend={weeklyTrend.percentageChange}
          trendLabel="vs last week"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          data-ocid="dashboard.budget_status.card"
          label="Budget Status"
          value={budget > 0 ? `${budgetPct.toFixed(0)}% used` : "Not Set"}
          trend={
            budget > 0 && monthlySpending > 0 ? budgetPct - 100 : undefined
          }
          trendLabel={
            budget > 0 ? `of ₹${budget.toLocaleString("en-IN")}` : undefined
          }
          icon={<Target className="w-4 h-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <Card
          className="border border-border"
          data-ocid="dashboard.category_chart.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display font-semibold text-foreground">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-64 text-center"
                data-ocid="dashboard.category_chart.empty_state"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <PieChartIcon />
                </div>
                <p className="text-muted-foreground text-sm">
                  Add expenses to see your spending breakdown
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] ?? "#94a3b8"}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [fmt(v), "Amount"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card
          className="border border-border"
          data-ocid="dashboard.trend_chart.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display font-semibold text-foreground">
              Daily Spending — Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-64 text-center"
                data-ocid="dashboard.trend_chart.empty_state"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <BarChartIcon />
                </div>
                <p className="text-muted-foreground text-sm">
                  Add expenses to see your spending trends
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(v: number) => [fmt(v), "Spent"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date ?? ""
                    }
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
                    fill="oklch(var(--primary))"
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights & Suggestions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Insights */}
        <Card
          className="border border-border"
          data-ocid="dashboard.insights.card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display font-semibold text-foreground flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </span>
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="dashboard.insights.empty_state"
              >
                Add expenses to see personalized insights
              </div>
            ) : (
              insights
                .slice(0, 3)
                .map((insight) => (
                  <InsightCard
                    key={insight.message}
                    insight={insight}
                    data-ocid={`dashboard.insight.item.${insights.indexOf(insight) + 1}`}
                  />
                ))
            )}
          </CardContent>
        </Card>

        {/* Smart Suggestions */}
        <Card
          className="border border-border"
          data-ocid="dashboard.suggestions.card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display font-semibold text-foreground flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/20">
                <Lightbulb className="w-4 h-4 text-accent-foreground" />
              </span>
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="dashboard.suggestions.empty_state"
              >
                No suggestions yet — add more expenses
              </div>
            ) : (
              <ul className="space-y-2.5">
                {suggestions.slice(0, 4).map((s) => {
                  const idx = suggestions.indexOf(s);
                  const Icon = SUGGESTION_ICONS[idx % SUGGESTION_ICONS.length];
                  return (
                    <li
                      key={s}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50 transition-fast hover:bg-muted/70"
                      data-ocid={`dashboard.suggestion.item.${idx + 1}`}
                    >
                      <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </span>
                      <span className="text-sm text-foreground leading-snug">
                        {s}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      {budget > 0 && (
        <Card
          className="border border-border"
          data-ocid="dashboard.budget.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display font-semibold text-foreground flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15">
                <Target className="w-4 h-4 text-emerald-600" />
              </span>
              Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetProgressBar
              spent={monthlySpending}
              budget={budget}
              showValues
            />
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-display font-bold text-foreground mt-0.5">
                  {fmt(budget)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="font-display font-bold text-foreground mt-0.5">
                  {fmt(monthlySpending)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p
                  className={`font-display font-bold mt-0.5 ${
                    budget - monthlySpending >= 0
                      ? "text-emerald-600"
                      : "text-destructive"
                  }`}
                >
                  {fmt(Math.abs(budget - monthlySpending))}
                  {budget - monthlySpending < 0 && " over"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card
        className="border border-border"
        data-ocid="dashboard.recent_transactions.card"
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display font-semibold text-foreground">
            Recent Transactions
          </CardTitle>
          <Link to="/expenses" data-ocid="dashboard.view_all_expenses.link">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-primary hover:text-primary"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentExpenses.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="dashboard.recent_transactions.empty_state"
            >
              <p className="font-medium mb-1">No expenses yet</p>
              <p className="text-xs">Add your first expense to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentExpenses.map((expense, i) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-fast group"
                  data-ocid={`dashboard.transaction.item.${i + 1}`}
                >
                  {/* Category dot */}
                  <div
                    className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[expense.category] ?? "#94a3b8"}22`,
                      color: CATEGORY_COLORS[expense.category] ?? "#94a3b8",
                    }}
                  >
                    {expense.category.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Note + category */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {expense.note ?? expense.category}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {expense.category} · {fmtDate(expense.date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <span className="font-display font-bold text-foreground tabular-nums">
                    {fmt(expense.amount)}
                  </span>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-fast text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteExpense(expense.id)}
                    aria-label={`Delete expense ${expense.note ?? expense.category}`}
                    data-ocid={`dashboard.transaction.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Month Prediction */}
      {prediction > 0 && (
        <Card
          className="border border-border gradient-primary text-white overflow-hidden relative"
          data-ocid="dashboard.prediction.card"
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-12 -translate-x-12" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                  Spending Prediction
                </p>
                <p className="text-3xl font-display font-bold text-white">
                  {fmt(prediction)}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Forecasted total for next month, based on your historical data
                </p>
              </div>
              {budget > 0 && (
                <div className="sm:text-right">
                  <Badge
                    className={`border-0 px-3 py-1 font-semibold ${
                      prediction > budget
                        ? "bg-red-500/30 text-red-200"
                        : "bg-emerald-500/30 text-emerald-200"
                    }`}
                  >
                    {prediction > budget
                      ? `⚠ ${fmt(prediction - budget)} over budget`
                      : `✓ ${fmt(budget - prediction)} under budget`}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Inline icon stubs to avoid extra imports
function PieChartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
      aria-hidden="true"
    >
      <title>Pie chart</title>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
      aria-hidden="true"
    >
      <title>Bar chart</title>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
