"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/types";
import { format, subMonths, addMonths, startOfMonth, endOfMonth, isToday } from "date-fns";
import { Coffee, ShoppingCart, Train, Film, FileText, Gift, Activity, Briefcase, Plane, Coins, Trash2 } from "lucide-react";
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
    <div className="flex-col h-full" style={{ padding: "1rem" }}>
      
      <div className="flex-row justify-between items-center" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Transactions</h2>
        <button 
          onClick={exportCSV}
          style={{ background: "var(--card-bg)", color: "var(--primary)", border: "1px solid var(--border)", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
        >
          Export CSV
        </button>
      </div>

      {/* Date & Interval Selector */}
      <div className="flex-row justify-between items-center" style={{ marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        
        {/* Month Navigation */}
        <div className="flex-row gap-4" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <button onClick={handlePrevMonth} style={{ fontWeight: 500 }}>{format(subMonths(currentDate, 1), "MMM")}</button>
          <div style={{ color: "var(--foreground)", fontWeight: 700, borderBottom: "2px solid var(--foreground)", paddingBottom: "0.25rem", fontSize: "1rem" }}>
            {format(currentDate, "MMMM")}
          </div>
          <button onClick={handleNextMonth} style={{ fontWeight: 500 }}>{format(addMonths(currentDate, 1), "MMM")}</button>
        </div>

        {/* Custom Interval Toggle (React Datepicker) */}
        <div className="flex-col items-end gap-1 relative custom-datepicker-wrapper">
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Interval</span>
          <div className="flex-row gap-2 items-center">
            <DatePicker
              selected={new Date(startDate)}
              onChange={(date: Date | null) => { if (date) setStartDate(format(date, "yyyy-MM-dd")); }}
              selectsStart
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              customInput={
                <button style={{ 
                  background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--foreground)", 
                  padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer"
                }}>
                  {format(new Date(startDate), "dd MMM")} 📅
                </button>
              }
              withPortal
            />
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>to</span>
            <DatePicker
              selected={new Date(endDate)}
              onChange={(date: Date | null) => { if (date) setEndDate(format(date, "yyyy-MM-dd")); }}
              selectsEnd
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              minDate={new Date(startDate)}
              customInput={
                <button style={{ 
                  background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--foreground)", 
                  padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer"
                }}>
                  {format(new Date(endDate), "dd MMM")} 📅
                </button>
              }
              withPortal
            />
          </div>
        </div>
      </div>

      {/* Summary Header */}
      <div className="glass-panel flex-row justify-between" style={{ padding: "1rem", marginBottom: "1.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
        <div className="flex-row gap-2" style={{ color: "var(--danger)" }}>
          <span>▼</span> ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
        <div className="flex-row gap-2" style={{ color: "var(--success)" }}>
          <span>▲</span> ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
        <div className="flex-row gap-2" style={{ color: "var(--foreground)" }}>
          <span>=</span> {netTotal < 0 ? '-' : ''}₹{Math.abs(netTotal).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Transactions List */}
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", paddingRight: "0.5rem" }}>
        {loading ? (
          <div className="flex-col items-center justify-center h-full">
            <span style={{ color: "var(--text-muted)" }}>Loading...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center" style={{ color: "var(--text-muted)", marginTop: "3rem" }}>
            No transactions this month.
          </div>
        ) : (
          <div className="flex-col" style={{ gap: "0.5rem" }}>
            {expenses.map((expense) => {
              const { icon: Icon, colorClass } = getCategoryIcon(expense.category);
              const isIncome = expense.type === 'income';
              const d = new Date(expense.date);
              
              return (
                <div key={expense.id} className="list-item" style={{ padding: "0.5rem 0" }}>
                  <div className="flex-row gap-3">
                    <div className={`category-icon-box ${colorClass}`} style={{ borderRadius: "50%", width: "2.5rem", height: "2.5rem" }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-col">
                      <span className="text-base" style={{ fontWeight: 600 }}>{expense.title}</span>
                      <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {isToday(d) ? 'Today' : format(d, "dd MMMM")}
                      </span>
                    </div>
                  </div>
                  <div className="flex-row items-center gap-3">
                    <div className="text-base" style={{ color: isIncome ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                      {isIncome ? '▲' : '▼'} ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(expense.id)}
                        className="btn-icon" 
                        style={{ width: "28px", height: "28px", color: "var(--danger)", border: "none", background: "transparent" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
