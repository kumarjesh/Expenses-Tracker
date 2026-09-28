"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Budget, Expense } from "@/types";
import { Plus, Info, ArrowLeft } from "lucide-react";

interface BudgetsTabProps {
  expenses: Expense[];
}

export default function BudgetsTab({ expenses }: BudgetsTabProps) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "budgets"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetched: Budget[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Budget);
      });
      setBudgets(fetched);
    } catch (error) {
      console.error("Error fetching budgets: ", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return (
    <div className="flex-col animate-fade-in h-full" style={{ padding: "1rem" }}>
      <div className="flex-row justify-between items-center" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Budgets</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ background: "var(--primary)", color: "white", padding: "0.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Plus size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex-col justify-center items-center h-full">
          <span style={{ color: "var(--text-muted)" }}>Loading Budgets...</span>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex-col justify-center items-center h-full gap-4" style={{ color: "var(--text-muted)", marginTop: "4rem" }}>
          <Info size={48} style={{ opacity: 0.5 }} />
          <p>No budgets set yet.</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">Create a Budget</button>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {budgets.map(budget => {
            // Calculate spent
            const spent = expenses
              .filter(e => e.category === budget.category && e.type === 'expense')
              .reduce((sum, e) => sum + e.amount, 0);
              
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            
            // Visual warning logic
            let progressColor = budget.color;
            if (percentage >= 100) progressColor = "var(--danger)";
            else if (percentage >= 80) progressColor = "var(--danger)"; // Orange warning

            return (
              <div key={budget.id} className="glass-panel flex-col gap-2">
                <div className="flex-row justify-between items-center">
                  <div className="flex-row gap-2 items-center">
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: budget.color }}></div>
                    <span style={{ fontWeight: 600 }}>{budget.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}</span>
                </div>
                
                <div style={{ width: "100%", height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", marginTop: "0.5rem" }}>
                  <div style={{ height: "100%", width: `${percentage}%`, background: progressColor, transition: "width 0.3s ease" }}></div>
                </div>
                
                {percentage >= 80 && (
                  <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", textAlign: "right" }}>
                    {percentage >= 100 ? "Budget Exceeded!" : "Nearing Limit!"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddBudgetModal 
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            fetchBudgets();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddBudgetModal({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<'expense' | 'savings'>('expense');
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState("#4ade80");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const colors = ["#4ade80", "#2dd4bf", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f43f5e"];
  
  const categories = ["Dining", "Groceries", "Shopping", "Transit", "Entertainment", "Bills", "Health", "Travel"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !amount) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "budgets"), {
        userId: user.uid,
        name,
        category,
        amount: parseFloat(amount),
        color,
        type,
        createdAt: Date.now(),
      });
      onAdded();
    } catch (error) {
      console.error("Error adding budget: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-slide-up" style={{ zIndex: 100 }}>
      {/* Header */}
      <div className="modal-header justify-between">
        <button type="button" onClick={onClose} style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ color: "var(--foreground)", margin: 0, fontSize: "1.25rem" }}>Add Budget</h2>
        <button type="button" onClick={() => setShowInfo(true)} style={{ color: "var(--text-muted)" }}>
          <Info size={20} />
        </button>
      </div>

      <div className="modal-body custom-scrollbar">
        {/* Type Toggle */}
        <div className="tabs-container">
          <button 
            type="button"
            className={`tab ${type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => setType('expense')}
            style={{ borderRadius: "0.5rem 0 0 0.5rem", border: "1px solid var(--border)", background: type === 'expense' ? "rgba(239, 68, 68, 0.1)" : "transparent" }}
          >
            ▼ Expense Budget
          </button>
          <button 
            type="button"
            className={`tab ${type === 'savings' ? 'active-income' : ''}`}
            onClick={() => setType('savings')}
            style={{ borderRadius: "0 0.5rem 0.5rem 0", border: "1px solid var(--border)", background: type === 'savings' ? "rgba(34, 197, 94, 0.1)" : "transparent" }}
          >
            ▲ Savings Budget
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-col gap-6">
          
          {/* Main Input Card */}
          <div className="glass-panel flex-col items-center justify-center gap-4">
            <input 
              type="text" 
              placeholder="Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ background: "transparent", border: "none", borderBottom: "2px solid var(--border)", color: "var(--foreground)", fontSize: "1.5rem", textAlign: "center", fontWeight: 700, width: "80%", padding: "0.5rem", outline: "none" }}
              required
            />
            
            <div className="flex-row items-baseline gap-2">
              <span style={{ fontSize: "2rem", color: "var(--text-muted)" }}>₹</span>
              <input 
                type="number" 
                placeholder="0" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ background: "transparent", border: "none", borderBottom: "2px solid var(--border)", color: "var(--foreground)", fontSize: "2.5rem", textAlign: "center", fontWeight: 700, width: "120px", outline: "none" }}
                required
              />
              <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>/ 1 month</span>
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex-row justify-between" style={{ padding: "0.5rem 0" }}>
            {colors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ 
                  width: "36px", height: "36px", borderRadius: "50%", background: c,
                  border: color === c ? "2px solid white" : "none",
                  transform: color === c ? "scale(1.1)" : "none",
                  transition: "all 0.2s"
                }}
              />
            ))}
          </div>

          {/* Settings */}
          <div className="flex-col gap-2">
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Target Category</span>
            <div className="flex-row gap-2" style={{ overflowX: "auto", paddingBottom: "0.5rem" }} className="custom-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "0.75rem 1rem", borderRadius: "0.5rem", whiteSpace: "nowrap",
                    background: category === cat ? "var(--primary)" : "var(--card-bg)",
                    border: "1px solid var(--border)", color: category === cat ? "white" : "var(--foreground)"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Saving..." : "Set Budget"}
          </button>
        </form>
      </div>

      {/* Info Popup Modal */}
      {showInfo && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110 }}>
          <div className="glass-panel flex-col items-center gap-4 text-center" style={{ width: "80%", maxWidth: "350px", animation: "slideUp 0.3s ease-out" }}>
            <div style={{ background: "var(--primary)", padding: "1rem", borderRadius: "50%" }}>
              <PieChartIcon color="white" />
            </div>
            <h3 style={{ fontSize: "1.5rem" }}>Budgets</h3>
            <p style={{ color: "var(--text-muted)" }}>
              A budget sets a planned limit for spending or saving within a period. Budgets break down finances by timeframe, provide insights, and help you track and control your money.
            </p>
            <div className="flex-row gap-4 w-full" style={{ marginTop: "1rem" }}>
              <button type="button" onClick={() => setShowInfo(false)} style={{ flex: 1, padding: "1rem", borderRadius: "1rem", background: "rgba(255, 107, 107, 0.2)", color: "var(--danger)", fontWeight: 600 }}>
                Close
              </button>
              <button type="button" onClick={() => setShowInfo(false)} className="btn-primary" style={{ flex: 1 }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PieChartIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  );
}
