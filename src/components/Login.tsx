"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Wallet, LogIn } from "lucide-react";

export default function Login() {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className="flex-col justify-center items-center" style={{ minHeight: "100vh", width: "100%", padding: "1rem" }}>
      <div className="glass-panel text-center" style={{ maxWidth: "400px", width: "100%", animation: "slideUp 0.4s ease-out" }}>
        <div className="flex-col items-center justify-center" style={{ marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "1rem", borderRadius: "50%" }}>
            <Wallet size={48} style={{ color: "var(--primary)" }} />
          </div>
        </div>
        <h1 style={{ marginBottom: "0.5rem" }}>Expense Tracker</h1>
        <p className="text-muted" style={{ marginBottom: "2rem" }}>
          Manage your finances with a premium, seamless experience.
        </p>
        
        <button onClick={handleSignIn} className="btn-primary w-full">
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
