import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  type Category,
  type Expense,
} from "@/types";
import { format, parseISO } from "date-fns";
import {
  ArrowUpDown,
  Download,
  Filter,
  ReceiptText,
  RotateCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
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

type SortField = "date" | "amount";
type SortDir = "asc" | "desc";

const fmt = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#94a3b8";
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
interface FilterBarProps {
  selectedCategories: Category[];
  setSelectedCategories: (v: Category[]) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  onReset: () => void;
  resultCount: number;
}

function FilterBar({
  selectedCategories,
  setSelectedCategories,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onReset,
  resultCount,
}: FilterBarProps) {
  function toggleCategory(cat: Category) {
    setSelectedCategories(
      selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat],
    );
  }

  const allSelected = selectedCategories.length === 0;

  return (
    <Card
      className="border border-border bg-card"
      data-ocid="reports.filter_bar"
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Category badges */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3 h-3" />
              Category
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={allSelected ? "default" : "outline"}
                className="cursor-pointer select-none transition-smooth hover:opacity-80"
                onClick={() => setSelectedCategories([])}
                data-ocid="reports.filter.all_tab"
              >
                All
              </Badge>
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={
                    selectedCategories.includes(cat) ? "default" : "outline"
                  }
                  className="cursor-pointer select-none transition-smooth hover:opacity-80"
                  style={
                    selectedCategories.includes(cat)
                      ? {
                          backgroundColor: getCategoryColor(cat),
                          borderColor: getCategoryColor(cat),
                          color: "#fff",
                        }
                      : {
                          borderColor: getCategoryColor(cat),
                          color: getCategoryColor(cat),
                        }
                  }
                  onClick={() => toggleCategory(cat)}
                  data-ocid={`reports.filter.${cat.toLowerCase()}_tab`}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                From
              </p>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-38 bg-background"
                data-ocid="reports.start_date_input"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                To
              </p>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-38 bg-background"
                data-ocid="reports.end_date_input"
              />
            </div>
          </div>

          {/* Reset + count */}
          <div className="flex flex-col items-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-1.5"
              data-ocid="reports.reset_button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {resultCount}
              </span>{" "}
              result{resultCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Daily bar chart data ──────────────────────────────────────────────────────
function buildDailyData(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    map[e.date] = (map[e.date] ?? 0) + e.amount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: format(parseISO(date), "MMM d"),
      amount: +amount.toFixed(2),
    }));
}

// ── Pie data ──────────────────────────────────────────────────────────────────
function buildPieData(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  }
  return Object.entries(map).map(([name, value]) => ({
    name,
    value: +value.toFixed(2),
  }));
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-elevated text-sm">
      {label && <p className="text-muted-foreground mb-0.5">{label}</p>}
      <p className="font-semibold text-foreground">{fmt(payload[0].value)}</p>
    </div>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(expenses: Expense[]) {
  const header = "Category,Amount,Date,Note";
  const rows = expenses.map((e) =>
    [e.category, e.amount.toFixed(2), e.date, e.note ?? ""]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `spendwise-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const expenses = useStore((s) => s.expenses);

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleReset() {
    setSelectedCategories([]);
    setStartDate("");
    setEndDate("");
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(e.category as Category)
      )
        return false;
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [expenses, selectedCategories, startDate, endDate]);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const total = useMemo(
    () => filtered.reduce((s, e) => s + e.amount, 0),
    [filtered],
  );
  const count = filtered.length;
  const avg = count > 0 ? total / count : 0;
  const highest = useMemo(
    () => Math.max(0, ...filtered.map((e) => e.amount)),
    [filtered],
  );

  // ── Charts ──────────────────────────────────────────────────────────────────
  const dailyData = useMemo(() => buildDailyData(filtered), [filtered]);
  const pieData = useMemo(() => buildPieData(filtered), [filtered]);

  // ── Sort ────────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortField === "amount") return (a.amount - b.amount) * mult;
      return a.date.localeCompare(b.date) * mult;
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const hasData = filtered.length > 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div
        className="flex items-center justify-between gap-4"
        data-ocid="reports.page"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analyse and export your spending data
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={!hasData}
          onClick={() => exportCSV(sorted)}
          className="gap-2 hidden sm:flex"
          data-ocid="reports.export_button"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter bar */}
      <FilterBar
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={handleReset}
        resultCount={count}
      />

      {/* Summary cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="reports.summary_section"
      >
        <MetricCard
          label="Total Spending"
          value={fmt(total)}
          icon={<Wallet className="w-4 h-4" />}
          variant="gradient"
          data-ocid="reports.total_card"
        />
        <MetricCard
          label="Transactions"
          value={count.toString()}
          icon={<ReceiptText className="w-4 h-4" />}
          data-ocid="reports.count_card"
        />
        <MetricCard
          label="Avg per Expense"
          value={fmt(avg)}
          icon={<TrendingUp className="w-4 h-4" />}
          variant="accent"
          data-ocid="reports.avg_card"
        />
        <MetricCard
          label="Highest Single"
          value={fmt(highest)}
          icon={<ArrowUpDown className="w-4 h-4" />}
          data-ocid="reports.highest_card"
        />
      </div>

      {/* Charts */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        data-ocid="reports.chart_section"
      >
        {/* Bar chart */}
        <Card className="lg:col-span-2 border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display font-semibold">
              Daily Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData && dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={dailyData}
                  margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `₹${v}`}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "oklch(var(--muted)/0.3)" }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[6, 6, 0, 0]}
                    fill="oklch(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-60 flex flex-col items-center justify-center gap-2"
                data-ocid="reports.bar_chart.empty_state"
              >
                <ReceiptText className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No data for selected filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display font-semibold">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData && pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={getCategoryColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => fmt(value)}
                    contentStyle={{
                      background: "oklch(var(--card))",
                      border: "1px solid oklch(var(--border))",
                      borderRadius: "12px",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-60 flex flex-col items-center justify-center gap-2"
                data-ocid="reports.pie_chart.empty_state"
              >
                <ReceiptText className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense table */}
      <Card
        className="border border-border bg-card"
        data-ocid="reports.table_section"
      >
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display font-semibold">
            Transactions
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            disabled={!hasData}
            onClick={() => exportCSV(sorted)}
            className="gap-2 sm:hidden"
            data-ocid="reports.export_button_mobile"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {hasData ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-ocid="reports.table">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Category
                    </th>
                    <th
                      className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider"
                      data-ocid="reports.sort_amount_toggle"
                    >
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 justify-end hover:text-foreground transition-colors select-none cursor-pointer ml-auto"
                        onClick={() => toggleSort("amount")}
                      >
                        Amount
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th
                      className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider"
                      data-ocid="reports.sort_date_toggle"
                    >
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors select-none cursor-pointer"
                        onClick={() => toggleSort("date")}
                      >
                        Date
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((expense, idx) => (
                    <tr
                      key={expense.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-fast"
                      data-ocid={`reports.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-medium">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: getCategoryColor(
                                expense.category,
                              ),
                            }}
                          />
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-foreground tabular-nums">
                          {fmt(expense.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {format(parseISO(expense.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm hidden md:table-cell max-w-xs truncate">
                        {expense.note || (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="py-16 flex flex-col items-center gap-3 text-center px-4"
              data-ocid="reports.table.empty_state"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <ReceiptText className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <p className="font-semibold text-foreground">No expenses found</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try adjusting your filters, or add some expenses first.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-1 gap-2"
                data-ocid="reports.empty.reset_button"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
