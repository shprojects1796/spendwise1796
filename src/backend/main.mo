import List "mo:core/List";
import Types "types/expenses";
import ExpensesApi "mixins/expenses-api";

actor {
  let expenses = List.empty<Types.Expense>();
  var nextId = { var value : Nat = 0 };
  var budget = { var value : Float = 0.0 };

  include ExpensesApi(expenses, nextId, budget);
};
