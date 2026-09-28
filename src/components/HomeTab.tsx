"use client";

import { Expense } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";
import { ListPlus, Landmark, WalletCards } from "lucide-react";

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
    <div className="flex-col gap-4 animate-fade-in" style={{ padding: "0 1rem" }}>
      
      {/* Top Cards Row */}
      <div className="flex-row gap-4">
        {/* Bank Card (Active) */}
        <div style={{ flex: 1.2, border: "2px solid var(--primary)", borderRadius: "1rem", padding: "1rem", background: "var(--card-bg)", position: "relative" }}>
          <div style={{ position: "absolute", top: "12px", right: "12px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--primary)" }}></div>
          <h3 style={{ fontWeight: 700, fontSize: "1.25rem", margin: 0 }}>Bank</h3>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.25rem 0" }}>
            ₹{bankBalance.toLocaleString()}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: 0 }}>
            {expenses.length} transactions
          </p>
        </div>

        {/* Account Card (Inactive) */}
        <div className="flex-col items-center justify-center" style={{ flex: 1, border: "1px solid var(--card-border)", borderRadius: "1rem", padding: "1rem", background: "transparent" }}>
          <WalletCards size={24} style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }} />
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Account</span>
        </div>
      </div>

      {/* Budget Card */}
      <div className="flex-col items-center justify-center" style={{ border: "1px solid var(--card-border)", borderRadius: "1rem", padding: "2rem", background: "transparent", marginTop: "0.5rem" }}>
        <ListPlus size={24} style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }} />
        <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Budget</span>
      </div>

      {/* Analytics Chart */}
      <div style={{ border: "1px solid var(--card-border)", borderRadius: "1rem", padding: "1rem", background: "var(--card-bg)", marginTop: "0.5rem", height: "250px" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={true} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)", borderRadius: "0.5rem" }}
                itemStyle={{ color: "var(--primary)" }}
              />
              <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-col justify-center items-center h-full" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Not enough data to show chart
          </div>
        )}
      </div>

      <button 
        onClick={onViewTransactions}
        style={{ 
          background: "var(--card-bg)", 
          border: "1px solid var(--card-border)", 
          padding: "1rem", 
          borderRadius: "1rem", 
          color: "var(--text-muted)",
          fontWeight: 600,
          marginTop: "0.5rem",
          marginBottom: "1rem"
        }}
      >
        View All Transactions
      </button>

    </div>
  );
}
