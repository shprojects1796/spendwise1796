import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/store/useStore";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  type Category,
  type Expense,
} from "@/types";
import {
  CheckCircle,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface FormState {
  amount: string;
  category: Category | "";
  date: string;
  note: string;
}

interface FormErrors {
  amount?: string;
  category?: string;
  date?: string;
}

const todayStr = () => new Date().toISOString().split("T")[0];

function categoryBadgeStyle(category: string) {
  const color = CATEGORY_COLORS[category] ?? "#94a3b8";
  return { backgroundColor: `${color}22`, color, borderColor: `${color}44` };
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const parsed = Number.parseFloat(form.amount);
  if (!form.amount || Number.isNaN(parsed) || parsed <= 0) {
    errors.amount = "Please enter a valid amount greater than 0.";
  }
  if (!form.category) errors.category = "Please select a category.";
  if (!form.date) errors.date = "Please select a date.";
  return errors;
}

// Toast state
interface ToastMsg {
  id: number;
  message: string;
}

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useStore();

  // ─── Add form ────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    amount: "",
    category: "",
    date: todayStr(),
    note: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const showToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  // ─── Filter state ─────────────────────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // ─── Edit modal ───────────────────────────────────────────────────────────
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState<FormState>({
    amount: "",
    category: "",
    date: "",
    note: "",
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});

  // ─── Delete dialog ────────────────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      addExpense({
        id: crypto.randomUUID(),
        amount: Number.parseFloat(Number.parseFloat(form.amount).toFixed(2)),
        category: form.category as Category,
        date: form.date,
        note: form.note || undefined,
        createdAt: BigInt(Date.now()),
      });
      setForm({ amount: "", category: "", date: todayStr(), note: "" });
      setFormErrors({});
      setIsSubmitting(false);
      showToast("Expense added successfully!");
    }, 400);
  }

  function openEdit(expense: Expense) {
    setEditExpense(expense);
    setEditForm({
      amount: String(expense.amount),
      category: expense.category as Category,
      date: expense.date,
      note: expense.note ?? "",
    });
    setEditErrors({});
  }

  function handleEditSave() {
    if (!editExpense) return;
    const errors = validateForm(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    updateExpense({
      ...editExpense,
      amount: Number.parseFloat(Number.parseFloat(editForm.amount).toFixed(2)),
      category: editForm.category as Category,
      date: editForm.date,
      note: editForm.note || undefined,
    });
    setEditExpense(null);
    showToast("Expense updated successfully!");
  }

  function confirmDelete() {
    if (deleteId) {
      deleteExpense(deleteId);
      showToast("Expense deleted.");
    }
    setDeleteId(null);
  }

  // ─── Filtered + sorted expenses ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return expenses
      .filter((e) => filterCategory === "all" || e.category === filterCategory)
      .filter(
        (e) =>
          !filterSearch ||
          e.note?.toLowerCase().includes(filterSearch.toLowerCase()) ||
          e.category.toLowerCase().includes(filterSearch.toLowerCase()),
      )
      .filter((e) => !filterDateFrom || e.date >= filterDateFrom)
      .filter((e) => !filterDateTo || e.date <= filterDateTo)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filterCategory, filterSearch, filterDateFrom, filterDateTo]);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* ── Toasts ─────────────────────────────────────────────────── */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-ocid="expenses.toast"
            className="flex items-center gap-2 bg-card border border-border shadow-lg rounded-xl px-4 py-3 text-sm font-body text-foreground pointer-events-auto animate-in slide-in-from-right-4 duration-300"
          >
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Expenses
        </h1>
        <p className="text-muted-foreground mt-1 font-body">
          Track and manage all your expenses in one place.
        </p>
      </div>

      {/* ── Add Expense Form ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg">
              Add New Expense
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Fill in the details below to log an expense
            </p>
          </div>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {/* Amount */}
          <div className="space-y-1.5">
            <Label
              htmlFor="amount"
              className="font-body text-sm font-medium text-foreground"
            >
              Amount <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                ₹
              </span>
              <Input
                id="amount"
                data-ocid="expenses.amount.input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="pl-7 font-mono bg-input border-border focus:ring-ring"
                value={form.amount}
                onChange={(e) => {
                  setForm((f) => ({ ...f, amount: e.target.value }));
                  setFormErrors((fe) => ({ ...fe, amount: undefined }));
                }}
              />
            </div>
            {formErrors.amount && (
              <p
                data-ocid="expenses.amount.field_error"
                className="text-xs text-destructive font-body"
              >
                {formErrors.amount}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label
              htmlFor="category"
              className="font-body text-sm font-medium text-foreground"
            >
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, category: v as Category }));
                setFormErrors((fe) => ({ ...fe, category: undefined }));
              }}
            >
              <SelectTrigger
                data-ocid="expenses.category.select"
                className="bg-input border-border"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[c] }}
                      />
                      {c}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.category && (
              <p
                data-ocid="expenses.category.field_error"
                className="text-xs text-destructive font-body"
              >
                {formErrors.category}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor="date"
              className="font-body text-sm font-medium text-foreground"
            >
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              data-ocid="expenses.date.input"
              type="date"
              className="bg-input border-border font-body"
              value={form.date}
              onChange={(e) => {
                setForm((f) => ({ ...f, date: e.target.value }));
                setFormErrors((fe) => ({ ...fe, date: undefined }));
              }}
            />
            {formErrors.date && (
              <p
                data-ocid="expenses.date.field_error"
                className="text-xs text-destructive font-body"
              >
                {formErrors.date}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label
              htmlFor="note"
              className="font-body text-sm font-medium text-foreground"
            >
              Note{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="note"
              data-ocid="expenses.note.input"
              placeholder="e.g. Lunch with team"
              className="bg-input border-border font-body"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 flex justify-end pt-1">
            <Button
              data-ocid="expenses.add_button"
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-medium rounded-xl px-6 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Expense Table ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Table header + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Receipt className="w-5 h-5 text-primary shrink-0" />
            <h2 className="font-display font-semibold text-foreground text-lg">
              All Expenses
            </h2>
            <Badge variant="secondary" className="font-mono text-xs ml-1">
              {filtered.length}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                data-ocid="expenses.search_input"
                placeholder="Search…"
                className="pl-8 h-8 text-sm w-40 bg-input border-border font-body"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>
            {/* Category filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger
                data-ocid="expenses.filter.select"
                className="h-8 text-sm w-36 bg-input border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Date range */}
            <Input
              data-ocid="expenses.date_from.input"
              type="date"
              className="h-8 text-sm w-36 bg-input border-border font-body"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              title="From date"
            />
            <Input
              data-ocid="expenses.date_to.input"
              type="date"
              className="h-8 text-sm w-36 bg-input border-border font-body"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              title="To date"
            />
            {(filterCategory !== "all" ||
              filterSearch ||
              filterDateFrom ||
              filterDateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setFilterCategory("all");
                  setFilterSearch("");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                aria-label="Clear filters"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div
            data-ocid="expenses.empty_state"
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-lg mb-1">
              {expenses.length === 0 ? "No expenses yet" : "No results found"}
            </h3>
            <p className="text-muted-foreground font-body text-sm max-w-xs">
              {expenses.length === 0
                ? "Add your first expense above to start tracking your spending."
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-right px-6 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">
                    Note
                  </th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense, idx) => (
                  <tr
                    key={expense.id}
                    data-ocid={`expenses.item.${idx + 1}`}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="font-body text-xs font-medium rounded-lg border"
                        style={categoryBadgeStyle(expense.category)}
                      >
                        <span
                          className="w-2 h-2 rounded-full mr-1.5 shrink-0"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[expense.category] ?? "#94a3b8",
                          }}
                        />
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-foreground">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(`${expense.date}T00:00:00`).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                      {expense.note ?? (
                        <span className="italic opacity-40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`expenses.edit_button.${idx + 1}`}
                          className="w-8 h-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          onClick={() => openEdit(expense)}
                          aria-label="Edit expense"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`expenses.delete_button.${idx + 1}`}
                          className="w-8 h-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => setDeleteId(expense.id)}
                          aria-label="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────── */}
      <Dialog
        open={!!editExpense}
        onOpenChange={(open) => !open && setEditExpense(null)}
      >
        <DialogContent
          data-ocid="expenses.dialog"
          className="bg-card border-border rounded-2xl max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-foreground">
              Edit Expense
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium text-foreground">
                Amount <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                  ₹
                </span>
                <Input
                  data-ocid="expenses.edit.amount.input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="pl-7 font-mono bg-input border-border"
                  value={editForm.amount}
                  onChange={(e) => {
                    setEditForm((f) => ({ ...f, amount: e.target.value }));
                    setEditErrors((fe) => ({ ...fe, amount: undefined }));
                  }}
                />
              </div>
              {editErrors.amount && (
                <p className="text-xs text-destructive font-body">
                  {editErrors.amount}
                </p>
              )}
            </div>
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium text-foreground">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={editForm.category}
                onValueChange={(v) => {
                  setEditForm((f) => ({ ...f, category: v as Category }));
                  setEditErrors((fe) => ({ ...fe, category: undefined }));
                }}
              >
                <SelectTrigger
                  data-ocid="expenses.edit.category.select"
                  className="bg-input border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[c] }}
                        />
                        {c}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.category && (
                <p className="text-xs text-destructive font-body">
                  {editErrors.category}
                </p>
              )}
            </div>
            {/* Date */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium text-foreground">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="expenses.edit.date.input"
                type="date"
                className="bg-input border-border font-body"
                value={editForm.date}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, date: e.target.value }));
                  setEditErrors((fe) => ({ ...fe, date: undefined }));
                }}
              />
              {editErrors.date && (
                <p className="text-xs text-destructive font-body">
                  {editErrors.date}
                </p>
              )}
            </div>
            {/* Note */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium text-foreground">
                Note{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                data-ocid="expenses.edit.note.textarea"
                placeholder="Add a note…"
                className="bg-input border-border font-body resize-none"
                rows={2}
                value={editForm.note}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, note: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="expenses.edit.cancel_button"
              variant="outline"
              className="font-body border-border"
              onClick={() => setEditExpense(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="expenses.edit.save_button"
              className="font-body bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleEditSave}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent
          data-ocid="expenses.delete.dialog"
          className="bg-card border-border rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete Expense?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-muted-foreground">
              This action cannot be undone. The expense will be permanently
              removed from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="expenses.delete.cancel_button"
              className="font-body border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="expenses.delete.confirm_button"
              className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
