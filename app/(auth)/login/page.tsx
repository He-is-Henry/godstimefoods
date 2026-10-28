import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./login.client";

export const metadata: Metadata = {
  title: "Login - Secure Account Access",
  description: "Sign in to your account at Godstime Food Canteen.",
};

function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-xl shadow-2xl animate-pulse space-y-6">
        <div className="space-y-2 text-center">
          <div className="h-8 w-28 bg-slate-800 rounded-lg mx-auto" />
          <div className="h-4 w-44 bg-slate-800/60 rounded mx-auto" />
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-11 bg-slate-900/80 rounded-xl border border-purple-500/10" />
          <div className="h-11 bg-slate-900/80 rounded-xl border border-purple-500/10" />
          <div className="h-11 bg-purple-900/40 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginClient />
    </Suspense>
  );
}
