"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Coffee, ShoppingCart, Train, Film, FileText, Gift, 
  Briefcase, Plane, Coins, Activity, ArrowLeft 
} from "lucide-react";

interface ExpenseFormProps {
  onClose: () => void;
  onExpenseAdded: () => void;
}

const expenseCategories = [
  { name: "Dining", icon: Coffee, colorClass: "bg-slate" },
  { name: "Groceries", icon: ShoppingCart, colorClass: "bg-green" },
  { name: "Shopping", icon: Gift, colorClass: "bg-red" },
  { name: "Transit", icon: Train, colorClass: "bg-yellow" },
  { name: "Entertainment", icon: Film, colorClass: "bg-blue" },
  { name: "Bills", icon: FileText, colorClass: "bg-green" },
  { name: "Health", icon: Activity, colorClass: "bg-red" },
  { name: "Travel", icon: Plane, colorClass: "bg-orange" },
];

const incomeCategories = [
  { name: "Salary", icon: Briefcase, colorClass: "bg-green" },
  { name: "Bonus", icon: Coins, colorClass: "bg-yellow" },
  { name: "Gifts", icon: Gift, colorClass: "bg-red" },
];

export default function ExpenseForm({ onClose, onExpenseAdded }: ExpenseFormProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Dining");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !amount || !date) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "expenses"), {
        userId: user.uid,
        userEmail: user.email || "unknown",
        userName: user.displayName || "Unknown",
        title,
        category,
        amount: parseFloat(amount),
        type,
        date,
        createdAt: Date.now(),
      });
      onExpenseAdded();
    } catch (error) {
      console.error("Error adding transaction: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-slide-up">
      {/* Header */}
      <div className="modal-header justify-between">
        <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ color: "var(--text-muted)", margin: 0, fontSize: "1.25rem" }}>Add Transaction</h2>
        <div style={{ width: "24px" }} /> {/* Spacer */}
      </div>

      <div className="modal-body custom-scrollbar">
        {/* Type Toggle */}
        <div className="tabs-container">
          <button 
            className={`tab ${type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => { setType('expense'); setCategory("Dining"); }}
          >
            ▼ Expense
          </button>
          <button 
            className={`tab ${type === 'income' ? 'active-income' : ''}`}
            onClick={() => { setType('income'); setCategory("Salary"); }}
          >
            ▲ Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel flex-col gap-4">
          <div className="flex-row justify-between">
            <h3 className="text-2xl">Enter Title</h3>
            <input 
              type="date" 
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", outline: "none", textAlign: "right", fontFamily: "inherit" }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <input
            type="text"
            className="input-field"
            style={{ fontSize: "1.25rem", border: "none", background: "var(--background)", marginBottom: "1rem" }}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex-row gap-2" style={{ marginBottom: "1rem" }}>
            <span style={{ fontSize: "2rem", color: "var(--text-muted)" }}>₹</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              style={{ fontSize: "2.5rem", fontWeight: 700, border: "none", background: "var(--background)", padding: 0, margin: 0 }}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ textAlign: "center", color: "var(--primary)", fontWeight: 600, background: "rgba(99, 102, 241, 0.1)", padding: "0.75rem", borderRadius: "0.75rem", marginBottom: "1rem" }}>
            {category}
          </div>

          {/* Category Grid */}
          <div className="category-grid">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = category === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  className="category-item"
                >
                  <div className={`category-icon-box ${c.colorClass} ${isSelected ? 'selected' : ''}`}>
                    <Icon size={24} />
                  </div>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "2rem" }} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
