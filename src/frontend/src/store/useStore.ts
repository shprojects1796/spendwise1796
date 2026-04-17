import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CategoryBreakdown,
  Expense,
  Insight,
  WeeklyTrend,
} from "../types";

interface StoreState {
  expenses: Expense[];
  budget: number;
  username: string;
  isLoggedIn: boolean;
  darkMode: boolean;

  // Actions
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setBudget: (amount: number) => void;
  login: (username: string) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  setExpenses: (expenses: Expense[]) => void;

  // Computed helpers
  getTotalSpending: () => number;
  getMonthlySpending: (month?: string) => number;
  getCategoryBreakdown: () => CategoryBreakdown;
  getWeeklyTrend: () => WeeklyTrend;
  getPredictNextMonth: () => number;
  getInsights: () => Insight[];
  getSuggestions: () => string[];
}

export const useStore = create<StoreState>()(
  persist<StoreState>(
    (set, get) => ({
      expenses: [],
      budget: 3000,
      username: "",
      isLoggedIn: false,
      darkMode: false,

      addExpense: (expense) =>
        set((state) => ({ expenses: [expense, ...state.expenses] })),

      updateExpense: (updated) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === updated.id ? updated : e,
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      setBudget: (amount) => set({ budget: amount }),

      login: (username) => set({ isLoggedIn: true, username }),

      logout: () => set({ isLoggedIn: false, username: "" }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      setExpenses: (expenses) => set({ expenses }),

      getTotalSpending: () => {
        const { expenses } = get();
        return expenses.reduce((sum, e) => sum + e.amount, 0);
      },

      getMonthlySpending: (month) => {
        const { expenses } = get();
        const target = month ?? new Date().toISOString().slice(0, 7);
        return expenses
          .filter((e) => e.date.startsWith(target))
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getCategoryBreakdown: () => {
        const { expenses } = get();
        const breakdown: CategoryBreakdown = {
          food: 0,
          travel: 0,
          bills: 0,
          shopping: 0,
          health: 0,
          other: 0,
        };
        for (const e of expenses) {
          const key = e.category.toLowerCase() as keyof CategoryBreakdown;
          if (key in breakdown) {
            breakdown[key] += e.amount;
          } else {
            breakdown.other += e.amount;
          }
        }
        return breakdown;
      },

      getWeeklyTrend: () => {
        const { expenses } = get();
        const now = Date.now();
        const msPerDay = 86400000;
        const weekStart = now - 7 * msPerDay;
        const prevWeekStart = now - 14 * msPerDay;

        let current = 0;
        let previous = 0;

        for (const e of expenses) {
          const ts = new Date(e.date).getTime();
          if (ts >= weekStart) current += e.amount;
          else if (ts >= prevWeekStart) previous += e.amount;
        }

        const percentageChange =
          previous === 0 ? 0 : ((current - previous) / previous) * 100;

        return {
          currentWeekTotal: current,
          previousWeekTotal: previous,
          percentageChange,
        };
      },

      getPredictNextMonth: () => {
        const { expenses } = get();
        if (expenses.length === 0) return 0;

        const monthlyMap: Record<string, number> = {};
        for (const e of expenses) {
          const month = e.date.slice(0, 7);
          monthlyMap[month] = (monthlyMap[month] ?? 0) + e.amount;
        }
        const values = Object.values(monthlyMap);
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
      },

      getInsights: () => {
        const state = get();
        const insights: Insight[] = [];
        const { expenses, budget } = state;

        const breakdown: Record<string, number> = {};
        for (const e of expenses) {
          breakdown[e.category] = (breakdown[e.category] ?? 0) + e.amount;
        }

        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
        const topCategory = Object.entries(breakdown).sort(
          (a, b) => b[1] - a[1],
        )[0];

        // Insight 1: Budget usage — always shown
        const monthly = state.getMonthlySpending();
        if (budget > 0 && monthly > budget) {
          insights.push({
            message: `You've exceeded your monthly budget by ₹${(monthly - budget).toFixed(2)}.`,
            insightType: "warning",
          });
        } else if (budget > 0 && monthly > 0) {
          const pct = Math.round((monthly / budget) * 100);
          insights.push({
            message: `You've used ${pct}% of your monthly budget this month.`,
            insightType: pct >= 80 ? "warning" : "info",
          });
        } else {
          insights.push({
            message: "No spending recorded yet this month. Great start!",
            insightType: "success",
          });
        }

        // Insight 2: Top category — always shown
        if (topCategory && total > 0) {
          insights.push({
            message: `${topCategory[0]} is your highest spending category at ₹${topCategory[1].toFixed(2)}.`,
            insightType: topCategory[1] / total > 0.4 ? "warning" : "info",
          });
        } else {
          insights.push({
            message: "Add expenses to see your top spending category.",
            insightType: "info",
          });
        }

        // Insight 3: Weekly trend — conditional
        const { percentageChange } = state.getWeeklyTrend();
        if (percentageChange > 20) {
          insights.push({
            message: `Your expenses increased by ${Math.round(percentageChange)}% this week compared to last week.`,
            insightType: "warning",
          });
        } else if (percentageChange < -10) {
          insights.push({
            message: `Great job! You reduced spending by ${Math.abs(Math.round(percentageChange))}% this week.`,
            insightType: "success",
          });
        } else {
          insights.push({
            message:
              "Your weekly spending is stable. Keep monitoring your habits.",
            insightType: "success",
          });
        }

        return insights;
      },

      getSuggestions: () => {
        const state = get();
        const suggestions: string[] = [];
        const breakdown = state.getCategoryBreakdown();
        const total = state.getTotalSpending();

        if (total === 0) {
          return [
            "Start tracking your expenses to get personalized suggestions.",
            "Set a monthly budget to monitor your spending progress.",
          ];
        }

        if (breakdown.food / total > 0.35)
          suggestions.push(
            "Reduce dining out — try cooking at home more often.",
          );
        if (breakdown.shopping / total > 0.25)
          suggestions.push("Cut back on shopping expenses this month.");
        if (breakdown.travel / total > 0.2)
          suggestions.push(
            "Consider carpooling or public transport to save on travel.",
          );
        if (breakdown.bills / total > 0.3)
          suggestions.push(
            "Review your subscriptions and cancel unused services.",
          );
        if (breakdown.health / total > 0.2)
          suggestions.push(
            "Explore generic medication options to reduce health costs.",
          );

        const { percentageChange } = state.getWeeklyTrend();
        if (percentageChange > 15)
          suggestions.push(
            "Your weekly spending is trending up — try to limit discretionary purchases.",
          );

        const monthly = state.getMonthlySpending();
        const budget = state.budget;
        if (budget > 0 && monthly > budget * 0.9)
          suggestions.push(
            "You're close to your budget limit — pause non-essential spending.",
          );

        if (suggestions.length < 2) {
          suggestions.push(
            "Set savings goals to stay motivated and build financial resilience.",
          );
          suggestions.push("Review your expenses weekly to spot trends early.");
        }

        return suggestions.slice(0, 5);
      },
    }),
    {
      name: "spendwise-storage",
    },
  ),
);
