"use client";

import { Expense } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";
import { ListPlus, WalletCards, ArrowRight } from "lucide-react";

interface HomeTabProps {
  expenses: Expense[];
  onViewTransactions: () => void;
}

export default function HomeTab({ expenses, onViewTransactions }: HomeTabProps) {
  
  // Calculate total bank balance (Income - Expense)
  const totalExpense = expenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const bankBalance = totalIncome - totalExpense;

  // Prepare data for the chart (aggregate expenses by date)
  const chartDataMap = new Map<string, number>();
  
  // Sort expenses ascending for chart timeline
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sortedExpenses.forEach(exp => {
    if (exp.type === 'expense') {
      const dateStr = format(new Date(exp.date), "MMM dd");
      const current = chartDataMap.get(dateStr) || 0;
      chartDataMap.set(dateStr, current + exp.amount);
    }
  });

  const chartData = Array.from(chartDataMap.entries()).map(([date, amount]) => ({ date, amount }));

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ padding: "0.75rem 0.85rem" }}>
      
      {/* Top Cards Row */}
      <div className="flex-row gap-3">
        {/* Bank Card (Active) */}
        <div 
          style={{ 
            flex: 1.3, 
            border: "2px solid var(--primary)", 
            borderRadius: "0.75rem", 
            padding: "0.85rem 1rem", 
            background: "var(--card-bg)", 
            position: "relative" 
          }}
        >
          <div style={{ position: "absolute", top: "10px", right: "10px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--primary)" }}></div>
          <h3 style={{ fontWeight: 600, fontSize: "0.85rem", margin: 0, color: "var(--text-muted)" }}>Total Balance</h3>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, margin: "0.2rem 0", color: bankBalance >= 0 ? "var(--foreground)" : "var(--danger)" }}>
            ₹{bankBalance.toLocaleString('en-IN')}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", margin: 0 }}>
            {expenses.length} total entries
          </p>
        </div>

        {/* Account Summary Card */}
        <div 
          className="flex-col items-center justify-center" 
          style={{ 
            flex: 1, 
            border: "1px solid var(--card-border)", 
            borderRadius: "0.75rem", 
            padding: "0.85rem 0.5rem", 
            background: "var(--card-bg)" 
          }}
        >
          <WalletCards size={20} style={{ color: "var(--primary)", marginBottom: "0.35rem" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)" }}>Accounts</span>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Cash & Bank</span>
        </div>
      </div>

      {/* Analytics Chart Container */}
      <div 
        style={{ 
          border: "1px solid var(--card-border)", 
          borderRadius: "0.75rem", 
          padding: "0.85rem", 
          background: "var(--card-bg)", 
          height: "220px" 
        }}
      >
        <div className="flex-row justify-between items-center" style={{ marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)" }}>Spending Trend</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>This period</span>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickMargin={6} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)", borderRadius: "0.5rem", fontSize: "0.75rem" }}
                itemStyle={{ color: "var(--primary)" }}
              />
              <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-col justify-center items-center h-full" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Add transactions to see spending trends
          </div>
        )}
      </div>

      {/* View All Transactions CTA */}
      <button 
        onClick={onViewTransactions}
        className="flex-row justify-between items-center"
        style={{ 
          background: "var(--card-bg)", 
          border: "1px solid var(--card-border)", 
          padding: "0.75rem 1rem", 
          borderRadius: "0.75rem", 
          color: "var(--foreground)",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer"
        }}
      >
        <span>View Full Transactions Ledger</span>
        <ArrowRight size={16} color="var(--primary)" />
      </button>
    </div>
  );
}
