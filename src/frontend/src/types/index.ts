export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: bigint;
}

export interface CreateExpenseInput {
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface UpdateExpenseInput {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface CategoryBreakdown {
  food: number;
  travel: number;
  bills: number;
  shopping: number;
  health: number;
  other: number;
}

export interface WeeklyTrend {
  currentWeekTotal: number;
  previousWeekTotal: number;
  percentageChange: number;
}

export interface Insight {
  message: string;
  insightType: string; // "warning" | "info" | "success"
}

export type Category =
  | "Food"
  | "Travel"
  | "Bills"
  | "Shopping"
  | "Health"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Health",
  "Other",
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#4ade80",
  Travel: "#60a5fa",
  Bills: "#f59e0b",
  Shopping: "#a78bfa",
  Health: "#34d399",
  Other: "#94a3b8",
};

export interface AppState {
  expenses: Expense[];
  budget: number;
  username: string;
  isLoggedIn: boolean;
  darkMode: boolean;
}
