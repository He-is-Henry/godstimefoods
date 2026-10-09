"use client";

import SessionManager from "@/components/SessionManager";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Mail, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export default function ProfileClient() {
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const paddedId = String(user.id).padStart(4, "0");
      document.title = `${user.firstName}'s Profile (${paddedId}) - Godstime Foods`;
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
        <p className="text-slate-300">Please log in to view your profile.</p>
      </div>
    );
  }

  const paddedId = String(user.id).padStart(4, "0");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-tr from-purple-600 to-pink-600 text-white font-bold text-xl shadow-lg shadow-pink-950/30">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-xs text-purple-300 font-mono">Member ID: {paddedId}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300">
            <Mail className="h-4 w-4 text-purple-400 shrink-0" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="capitalize">{user.role || "Customer"} Account</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <SessionManager />
    </div>
  );
}
