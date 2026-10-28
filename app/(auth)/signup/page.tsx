import type { Metadata } from "next";
import { Suspense } from "react";
import SignupClient from "./signup.client";

export const metadata: Metadata = {
  title: "Sign Up - Create Your Account",
  description: "Register a new account at Godstime Food Canteen.",
};

function SignupSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-xl shadow-2xl animate-pulse space-y-5">
        <div className="space-y-2 text-center">
          <div className="h-8 w-40 bg-slate-800 rounded-lg mx-auto" />
          <div className="h-4 w-28 bg-slate-800/60 rounded mx-auto" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-slate-900/80 rounded-xl border border-purple-500/10" />
          <div className="h-10 bg-slate-900/80 rounded-xl border border-purple-500/10" />
        </div>
        <div className="h-11 bg-slate-900/80 rounded-xl border border-purple-500/10" />
        <div className="h-11 bg-slate-900/80 rounded-xl border border-purple-500/10" />
        <div className="h-32 bg-purple-950/30 rounded-xl border border-purple-500/10" />
        <div className="h-11 bg-purple-900/40 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupClient />
    </Suspense>
  );
}
