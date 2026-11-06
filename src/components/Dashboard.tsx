"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Expense } from "@/types";
import ExpenseForm from "./ExpenseForm";
import Ledger from "./Ledger";
import HomeTab from "./HomeTab";
import BudgetsTab from "./BudgetsTab";
import MoreTab from "./MoreTab";
import { Home, List, PieChart, MoreHorizontal, Plus, Moon, Sun, LogOut } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("transactions");
  const [showAddModal, setShowAddModal] = useState(false);

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "expenses"),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetched: Expense[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Expense);
      });
      setExpenses(fetched);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    } finally {
      setLoading(false);
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "expenses", id));
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete transaction.");
    }
  };

  return (
    <div className="app-wrapper">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ color: "var(--foreground)", fontSize: "1.2rem" }}>Expense Tracker</h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <NavItem icon={<Home size={18} />} label="Home" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} desktop />
          <NavItem icon={<List size={18} />} label="Transactions" isActive={activeTab === "transactions"} onClick={() => setActiveTab("transactions")} desktop />
          <NavItem icon={<PieChart size={18} />} label="Budgets" isActive={activeTab === "budgets"} onClick={() => setActiveTab("budgets")} desktop />
          <NavItem icon={<MoreHorizontal size={18} />} label="More" isActive={activeTab === "more"} onClick={() => setActiveTab("more")} desktop />
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
          <button onClick={toggleTheme} className="flex-row gap-2" style={{ color: "var(--text-muted)", padding: "0.4rem 0.5rem", borderRadius: "0.5rem" }}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>

          <button onClick={() => auth.signOut()} className="flex-row gap-2" style={{ color: "var(--danger)", padding: "0.4rem 0.5rem", borderRadius: "0.5rem" }}>
            <LogOut size={18} />
            <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Compact Header */}
        <header className="flex-row justify-between" style={{ padding: "0.65rem 1rem", borderBottom: "1px solid var(--border)", background: "var(--card-bg)" }}>
          <div className="flex-row gap-2">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                style={{ width: "30px", height: "30px", borderRadius: "50%", border: "2px solid var(--primary)" }}
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <h1 style={{ fontSize: "0.95rem", margin: 0, fontWeight: 700 }}>
                Hello, {user?.displayName ? user.displayName.split(" ")[0] : "User"}
              </h1>
            </div>
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="btn-icon" style={{ width: "32px", height: "32px" }}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </header>

        {/* Tab Content Container - Smooth unified scroll with safe bottom padding */}
        <div className="tab-scroll-container">
          {activeTab === "transactions" && (
            <Ledger
              expenses={expenses}
              loading={loading}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              onDelete={handleDeleteExpense}
            />
          )}

          {activeTab === "home" && (
            <HomeTab expenses={expenses} onViewTransactions={() => setActiveTab("transactions")} />
          )}

          {activeTab === "budgets" && (
            <BudgetsTab expenses={expenses} />
          )}

          {activeTab === "more" && (
            <MoreTab onDataMigrated={fetchExpenses} />
          )}
        </div>

        {/* Floating Action Button */}
        <button
          className="fab-button"
          onClick={() => setShowAddModal(true)}
          aria-label="Add transaction"
        >
          <Plus size={24} />
        </button>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <NavItem icon={<Home size={19} />} label="Home" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} />
        <NavItem icon={<List size={19} />} label="Transactions" isActive={activeTab === "transactions"} onClick={() => setActiveTab("transactions")} />
        <NavItem icon={<PieChart size={19} />} label="Budgets" isActive={activeTab === "budgets"} onClick={() => setActiveTab("budgets")} />
        <NavItem icon={<MoreHorizontal size={19} />} label="More" isActive={activeTab === "more"} onClick={() => setActiveTab("more")} />
      </nav>

      {/* Modals */}
      {showAddModal && (
        <ExpenseForm
          onClose={() => setShowAddModal(false)}
          onExpenseAdded={() => {
            fetchExpenses();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick, desktop = false }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, desktop?: boolean }) {
  if (desktop) {
    return (
      <button
        onClick={onClick}
        className="flex-row gap-3"
        style={{
          padding: "0.6rem 0.85rem",
          borderRadius: "0.5rem",
          backgroundColor: isActive ? "var(--primary)" : "transparent",
          color: isActive ? "#ffffff" : "var(--text-muted)",
          fontWeight: isActive ? 600 : 500,
          fontSize: "0.875rem"
        }}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex-col items-center gap-1"
      style={{
        color: isActive ? "var(--primary)" : "var(--text-muted)",
        padding: "0.25rem 0.5rem",
        opacity: isActive ? 1 : 0.75,
        minWidth: "60px"
      }}
    >
      {icon}
      <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>{label}</span>
    </button>
  );
}
