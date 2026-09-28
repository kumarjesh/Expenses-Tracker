"use client";

import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {user ? <Dashboard /> : <Login />}
    </main>
  );
}
