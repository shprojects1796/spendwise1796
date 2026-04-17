import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Category = string;
export interface CategoryBreakdown {
    other: number;
    food: number;
    travel: number;
    bills: number;
    shopping: number;
    health: number;
}
export type Timestamp = bigint;
export interface CreateExpenseInput {
    date: string;
    note?: string;
    category: Category;
    amount: number;
}
export interface WeeklyTrend {
    percentageChange: number;
    currentWeekTotal: number;
    previousWeekTotal: number;
}
export type ExpenseId = string;
export interface Expense {
    id: ExpenseId;
    date: string;
    note?: string;
    createdAt: Timestamp;
    category: Category;
    amount: number;
}
export interface Insight {
    insightType: string;
    message: string;
}
export interface UpdateExpenseInput {
    id: ExpenseId;
    date: string;
    note?: string;
    category: Category;
    amount: number;
}
export interface backendInterface {
    categoryBreakdown(): Promise<CategoryBreakdown>;
    createExpense(input: CreateExpenseInput): Promise<Expense>;
    deleteExpense(id: ExpenseId): Promise<boolean>;
    getBudget(): Promise<number>;
    getExpense(id: ExpenseId): Promise<Expense | null>;
    getInsights(): Promise<Array<Insight>>;
    getSuggestions(): Promise<Array<string>>;
    listExpenses(): Promise<Array<Expense>>;
    monthlySpending(month: string): Promise<number>;
    predictNextMonth(): Promise<number>;
    setBudget(amount: number): Promise<void>;
    totalSpending(): Promise<number>;
    updateExpense(input: UpdateExpenseInput): Promise<boolean>;
    weeklyTrend(): Promise<WeeklyTrend>;
}
