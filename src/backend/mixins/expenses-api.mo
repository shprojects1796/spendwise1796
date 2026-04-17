import List "mo:core/List";
import Types "../types/expenses";
import Common "../types/common";
import Runtime "mo:core/Runtime";

mixin (
  expenses : List.List<Types.Expense>,
  nextId : { var value : Nat },
  budget : { var value : Float },
) {
  // --- Expense CRUD ---

  public func createExpense(input : Types.CreateExpenseInput) : async Types.Expense {
    Runtime.trap("not implemented");
  };

  public query func getExpense(id : Common.ExpenseId) : async ?Types.Expense {
    Runtime.trap("not implemented");
  };

  public func updateExpense(input : Types.UpdateExpenseInput) : async Bool {
    Runtime.trap("not implemented");
  };

  public func deleteExpense(id : Common.ExpenseId) : async Bool {
    Runtime.trap("not implemented");
  };

  public query func listExpenses() : async [Types.Expense] {
    Runtime.trap("not implemented");
  };

  // --- Aggregation ---

  public query func totalSpending() : async Float {
    Runtime.trap("not implemented");
  };

  public query func monthlySpending(month : Text) : async Float {
    Runtime.trap("not implemented");
  };

  public query func categoryBreakdown() : async Types.CategoryBreakdown {
    Runtime.trap("not implemented");
  };

  // --- Trend ---

  public query func weeklyTrend() : async Types.WeeklyTrend {
    Runtime.trap("not implemented");
  };

  // --- Budget ---

  public query func getBudget() : async Float {
    Runtime.trap("not implemented");
  };

  public func setBudget(amount : Float) : async () {
    Runtime.trap("not implemented");
  };

  // --- Prediction ---

  public query func predictNextMonth() : async Float {
    Runtime.trap("not implemented");
  };

  // --- Suggestions ---

  public query func getSuggestions() : async [Text] {
    Runtime.trap("not implemented");
  };

  // --- AI Insights ---

  public query func getInsights() : async [Types.Insight] {
    Runtime.trap("not implemented");
  };
};
