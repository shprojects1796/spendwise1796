import List "mo:core/List";
import Types "../types/expenses";
import Common "../types/common";
import Runtime "mo:core/Runtime";

module {
  // CRUD
  public func createExpense(
    expenses : List.List<Types.Expense>,
    input : Types.CreateExpenseInput,
    id : Common.ExpenseId,
    now : Common.Timestamp,
  ) : Types.Expense {
    Runtime.trap("not implemented");
  };

  public func getExpense(
    expenses : List.List<Types.Expense>,
    id : Common.ExpenseId,
  ) : ?Types.Expense {
    Runtime.trap("not implemented");
  };

  public func updateExpense(
    expenses : List.List<Types.Expense>,
    input : Types.UpdateExpenseInput,
  ) : Bool {
    Runtime.trap("not implemented");
  };

  public func deleteExpense(
    expenses : List.List<Types.Expense>,
    id : Common.ExpenseId,
  ) : Bool {
    Runtime.trap("not implemented");
  };

  public func listExpenses(expenses : List.List<Types.Expense>) : [Types.Expense] {
    Runtime.trap("not implemented");
  };

  // Aggregation
  public func totalSpending(expenses : List.List<Types.Expense>) : Float {
    Runtime.trap("not implemented");
  };

  public func monthlySpending(
    expenses : List.List<Types.Expense>,
    month : Text, // "YYYY-MM"
  ) : Float {
    Runtime.trap("not implemented");
  };

  public func categoryBreakdown(expenses : List.List<Types.Expense>) : Types.CategoryBreakdown {
    Runtime.trap("not implemented");
  };

  // Trend
  public func weeklyTrend(expenses : List.List<Types.Expense>, nowMs : Int) : Types.WeeklyTrend {
    Runtime.trap("not implemented");
  };

  // Prediction: rolling average of past 3 months
  public func predictNextMonth(expenses : List.List<Types.Expense>) : Float {
    Runtime.trap("not implemented");
  };

  // Suggestions
  public func generateSuggestions(
    expenses : List.List<Types.Expense>,
    budget : Float,
  ) : [Text] {
    Runtime.trap("not implemented");
  };

  // AI-style insights
  public func generateInsights(
    expenses : List.List<Types.Expense>,
  ) : [Types.Insight] {
    Runtime.trap("not implemented");
  };
};
