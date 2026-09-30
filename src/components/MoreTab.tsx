"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Moon, Sun, LogOut, DownloadCloud, AlertCircle, CheckCircle } from "lucide-react";

export default function MoreTab({ onDataMigrated }: { onDataMigrated: () => void }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error' | 'no-data'>('idle');

  const migrateData = async () => {
    if (!user) return;
    setMigrating(true);
    setMigrationStatus('idle');
    try {
      // Find old expenses in the root collection
      const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setMigrationStatus('no-data');
        setMigrating(false);
        return;
      }

      // Move them to the subcollection
      for (const document of querySnapshot.docs) {
        const data = document.data();
        
        // add to new subcollection
        await addDoc(collection(db, "users", user.uid, "expenses"), data);
        
        // delete from old collection
        await deleteDoc(doc(db, "expenses", document.id));
      }

      setMigrationStatus('success');
      onDataMigrated();
    } catch (error) {
      console.error("Migration error:", error);
      setMigrationStatus('error');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="flex-col animate-fade-in h-full" style={{ padding: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>More Settings</h2>

      <div className="flex-col gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="glass-panel flex-row items-center justify-between" 
          style={{ padding: "1rem", borderRadius: "1rem", border: "1px solid var(--border)", cursor: "pointer", background: "var(--card-bg)" }}
        >
          <div className="flex-row items-center gap-3">
            {theme === "light" ? <Moon size={24} color="var(--primary)" /> : <Sun size={24} color="var(--primary)" />}
            <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--foreground)" }}>
              Appearance
            </span>
          </div>
          <span style={{ color: "var(--text-muted)" }}>
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* Migrate Data */}
        <div className="glass-panel flex-col gap-3" style={{ padding: "1rem", borderRadius: "1rem", border: "1px solid var(--border)", background: "var(--card-bg)" }}>
          <div className="flex-row items-center gap-3">
            <DownloadCloud size={24} color="var(--primary)" />
            <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--foreground)" }}>
              Sync Old Data
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            If you are missing data from before the database upgrade, click this button to securely migrate your old data into your new secure folder.
          </p>
          <button 
            onClick={migrateData} 
            disabled={migrating}
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          >
            {migrating ? "Syncing..." : "Sync My Data"}
          </button>
          
          {migrationStatus === 'success' && (
            <div className="flex-row items-center gap-2" style={{ color: "var(--success)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              <CheckCircle size={16} /> Successfully synced!
            </div>
          )}
          {migrationStatus === 'no-data' && (
            <div className="flex-row items-center gap-2" style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              <AlertCircle size={16} /> No old data found.
            </div>
          )}
          {migrationStatus === 'error' && (
            <div className="flex-row items-center gap-2" style={{ color: "var(--danger)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              <AlertCircle size={16} /> Error syncing data. Try again.
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button 
          onClick={() => auth.signOut()} 
          className="glass-panel flex-row items-center gap-3" 
          style={{ padding: "1rem", borderRadius: "1rem", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--danger)", background: "rgba(239, 68, 68, 0.05)", cursor: "pointer", marginTop: "1rem" }}
        >
          <LogOut size={24} />
          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
