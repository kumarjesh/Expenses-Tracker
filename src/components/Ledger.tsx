"use client";

import { Expense } from "@/types";
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { 
  Coffee, ShoppingCart, Train, Film, FileText, Gift, Activity, 
  Briefcase, Plane, Coins, Trash2, ChevronLeft, ChevronRight, Download 
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface LedgerProps {
  expenses: Expense[];
  loading: boolean;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  onDelete?: (id: string) => void;
}

const getCategoryIcon = (categoryName: string) => {
  const icons: Record<string, { icon: any, colorClass: string }> = {
    Dining: { icon: Coffee, colorClass: "bg-slate" },
    Groceries: { icon: ShoppingCart, colorClass: "bg-green" },
    Shopping: { icon: Gift, colorClass: "bg-red" },
    Transit: { icon: Train, colorClass: "bg-yellow" },
    Entertainment: { icon: Film, colorClass: "bg-blue" },
    Bills: { icon: FileText, colorClass: "bg-green" },
    Health: { icon: Activity, colorClass: "bg-red" },
    Travel: { icon: Plane, colorClass: "bg-orange" },
    Salary: { icon: Briefcase, colorClass: "bg-green" },
    Bonus: { icon: Coins, colorClass: "bg-yellow" },
    Gifts: { icon: Gift, colorClass: "bg-red" },
  };
  return icons[categoryName] || { icon: Coffee, colorClass: "bg-slate" };
};

export default function Ledger({ expenses, loading, startDate, setStartDate, endDate, setEndDate, onDelete }: LedgerProps) {
  
  const currentDate = new Date(startDate);
  
  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1);
    setStartDate(format(startOfMonth(prev), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(prev), "yyyy-MM-dd"));
  };

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    setStartDate(format(startOfMonth(next), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(next), "yyyy-MM-dd"));
  };

  const totalExpense = expenses
    .filter(e => e.type !== 'income')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const netTotal = totalIncome - totalExpense;

  // Sort expenses by date descending, then by createdAt descending
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return b.createdAt - a.createdAt; 
  });

  // Group sorted expenses by date and calculate daily sums
  const groupedExpenses = sortedExpenses.reduce((acc, expense) => {
    if (!acc[expense.date]) {
      acc[expense.date] = { items: [], dailySum: 0 };
    }
    acc[expense.date].items.push(expense);
    if (expense.type === 'income') {
      acc[expense.date].dailySum += expense.amount;
    } else {
      acc[expense.date].dailySum -= expense.amount;
    }
    return acc;
  }, {} as Record<string, { items: Expense[], dailySum: number }>);

  const exportCSV = () => {
    const headers = ["Date", "Title", "Category", "Type", "Amount"];
    const rows = expenses.map(e => [
      e.date,
      `"${e.title}"`,
      e.category,
      e.type,
      e.amount
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-col" style={{ padding: "0.75rem 0.85rem" }}>
      
      {/* Top Action Bar: Title & Export CSV */}
      <div className="flex-row justify-between items-center" style={{ marginBottom: "0.5rem" }}>
        <div className="flex-row items-center gap-2">
          <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Transactions</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--card-bg)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "1rem" }}>
            {expenses.length}
          </span>
        </div>
        
        <button 
          onClick={exportCSV}
          title="Export CSV"
          className="flex-row items-center gap-1"
          style={{ 
            background: "var(--card-bg)", 
            color: "var(--primary)", 
            border: "1px solid var(--border)", 
            padding: "0.3rem 0.65rem", 
            borderRadius: "0.45rem", 
            fontSize: "0.75rem", 
            fontWeight: 600, 
            cursor: "pointer" 
          }}
        >
          <Download size={13} />
          <span>CSV</span>
        </button>
      </div>

      {/* Date Navigation & Custom Interval Selector - Single Sleek Toolbar */}
      <div 
        className="flex-row justify-between items-center glass-panel" 
        style={{ padding: "0.45rem 0.65rem", marginBottom: "0.5rem", borderRadius: "0.5rem" }}
      >
        {/* Month Switcher */}
        <div className="flex-row items-center gap-1">
          <button 
            onClick={handlePrevMonth} 
            className="btn-icon" 
            style={{ width: "26px", height: "26px", border: "none" }}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "75px", textAlign: "center" }}>
            {format(currentDate, "MMM yyyy")}
          </span>

          <button 
            onClick={handleNextMonth} 
            className="btn-icon" 
            style={{ width: "26px", height: "26px", border: "none" }}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Custom Range Picker */}
        <div className="flex-row items-center gap-1">
          <DatePicker
            selected={new Date(startDate)}
            onChange={(date: Date | null) => { if (date) setStartDate(format(date, "yyyy-MM-dd")); }}
            selectsStart
            startDate={new Date(startDate)}
            endDate={new Date(endDate)}
            customInput={
              <button style={{ 
                background: "var(--background)", 
                border: "1px solid var(--border)", 
                color: "var(--foreground)", 
                padding: "0.25rem 0.5rem", 
                borderRadius: "0.4rem", 
                fontSize: "0.75rem", 
                fontWeight: 600, 
                cursor: "pointer"
              }}>
                {format(new Date(startDate), "d MMM")}
              </button>
            }
            withPortal
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>–</span>
          <DatePicker
            selected={new Date(endDate)}
            onChange={(date: Date | null) => { if (date) setEndDate(format(date, "yyyy-MM-dd")); }}
            selectsEnd
            startDate={new Date(startDate)}
            endDate={new Date(endDate)}
            minDate={new Date(startDate)}
            customInput={
              <button style={{ 
                background: "var(--background)", 
                border: "1px solid var(--border)", 
                color: "var(--foreground)", 
                padding: "0.25rem 0.5rem", 
                borderRadius: "0.4rem", 
                fontSize: "0.75rem", 
                fontWeight: 600, 
                cursor: "pointer"
              }}>
                {format(new Date(endDate), "d MMM")}
              </button>
            }
            withPortal
          />
        </div>
      </div>

      {/* Summary Metrics Strip - High Density & Compact */}
      <div 
        className="glass-panel flex-row justify-between items-center" 
        style={{ padding: "0.5rem 0.75rem", marginBottom: "0.5rem", borderRadius: "0.5rem", fontSize: "0.78rem" }}
      >
        <div className="flex-col" style={{ gap: "0.1rem" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Expense</span>
          <span style={{ color: "var(--danger)", fontWeight: 700 }}>
            -₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="flex-col" style={{ gap: "0.1rem" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Income</span>
          <span style={{ color: "var(--success)", fontWeight: 700 }}>
            +₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="flex-col items-end" style={{ gap: "0.1rem" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Net Balance</span>
          <span style={{ color: netTotal >= 0 ? "var(--foreground)" : "var(--danger)", fontWeight: 700 }}>
            {netTotal < 0 ? '-' : ''}₹{Math.abs(netTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Transactions List - Unified high-density list without nested scroll container */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <div className="flex-col items-center justify-center" style={{ padding: "3rem 0" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading transactions...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center" style={{ color: "var(--text-muted)", padding: "3rem 1rem", fontSize: "0.85rem" }}>
            No transactions found for this period.
          </div>
        ) : (
          <div className="flex-col" style={{ gap: "0.35rem" }}>
            {Object.entries(groupedExpenses).map(([dateStr, group]) => {
              const d = new Date(dateStr);
              return (
                <div key={dateStr} className="flex-col" style={{ gap: "0.2rem" }}>
                  
                  {/* Clean Daily Subheader */}
                  <div 
                    className="flex-row justify-between items-center" 
                    style={{ 
                      color: "var(--text-muted)", 
                      fontSize: "0.72rem", 
                      fontWeight: 600,
                      padding: "0.45rem 0.35rem 0.2rem 0.35rem",
                      borderBottom: "1px solid var(--card-border)",
                      marginTop: "0.25rem"
                    }}
                  >
                    <span>{format(d, "EEE, d MMMM")}</span>
                    <span style={{ fontWeight: 600, color: group.dailySum < 0 ? "var(--danger)" : "var(--success)" }}>
                      {group.dailySum < 0 ? '-' : '+'}₹{Math.abs(group.dailySum).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  
                  {/* Daily Transaction Items */}
                  <div className="flex-col" style={{ gap: "0.15rem" }}>
                    {group.items.map((expense) => {
                      const { icon: Icon, colorClass } = getCategoryIcon(expense.category);
                      const isIncome = expense.type === 'income';
                      
                      return (
                        <div 
                          key={expense.id} 
                          className="transaction-row"
                        >
                          {/* Left: Category Icon & Title + Subtitle */}
                          <div className="flex-row gap-2 items-center" style={{ minWidth: 0, flex: 1 }}>
                            <div 
                              className={`category-icon-box ${colorClass}`} 
                              style={{ 
                                borderRadius: "50%", 
                                width: "2rem", 
                                height: "2rem", 
                                minWidth: "2rem",
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                              }}
                            >
                              <Icon size={14} />
                            </div>

                            <div className="flex-col" style={{ minWidth: 0, flex: 1 }}>
                              <span 
                                style={{ 
                                  fontSize: "0.85rem", 
                                  fontWeight: 600, 
                                  lineHeight: 1.25,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                              >
                                {expense.title}
                              </span>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.1 }}>
                                {expense.category}
                              </span>
                            </div>
                          </div>
                          
                          {/* Right: Amount & Delete Button */}
                          <div className="flex-row items-center gap-2" style={{ flexShrink: 0, marginLeft: "0.5rem" }}>
                            <div 
                              style={{ 
                                color: isIncome ? "var(--success)" : "var(--danger)", 
                                fontWeight: 700,
                                fontSize: "0.85rem"
                              }}
                            >
                              {isIncome ? '+' : '-'}₹{expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>

                            {onDelete && (
                              <button 
                                onClick={() => onDelete(expense.id)}
                                title="Delete"
                                style={{ 
                                  width: "24px", 
                                  height: "24px", 
                                  color: "var(--text-muted)", 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center",
                                  borderRadius: "4px"
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
