import Common "common";

module {
  public type Expense = {
    id : Common.ExpenseId;
    amount : Float;
    category : Common.Category;
    date : Text; // ISO date string
    note : ?Text;
    createdAt : Common.Timestamp;
  };

  public type CreateExpenseInput = {
    amount : Float;
    category : Common.Category;
    date : Text;
    note : ?Text;
  };

  public type UpdateExpenseInput = {
    id : Common.ExpenseId;
    amount : Float;
    category : Common.Category;
    date : Text;
    note : ?Text;
  };

  public type CategoryBreakdown = {
    food : Float;
    travel : Float;
    bills : Float;
    shopping : Float;
    health : Float;
    other : Float;
  };

  public type WeeklyTrend = {
    currentWeekTotal : Float;
    previousWeekTotal : Float;
    percentageChange : Float;
  };

  public type Insight = {
    message : Text;
    insightType : Text; // "warning" | "info" | "success"
  };
};
