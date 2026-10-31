"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSubmitted(true);
      toast.success("Instructions dispatched successfully if account exists.");
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-950/50">

        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-medium text-purple-400 hover:text-pink-400 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Recover Password</h2>
          <h3 className="text-sm text-purple-300/80 mt-1">We will send reset instructions to your inbox</h3>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-40" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30" strokeDashoffset="20"></path>
                  </svg>
                  Sending link...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center p-6 rounded-xl bg-purple-950/40 border border-purple-500/10 space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/30 rounded-full flex items-center justify-center text-pink-400 mb-2">
              <Mail size={22} />
            </div>
            <p className="text-sm text-purple-200">
              Check your inbox! If an account matches <span className="text-pink-400 font-semibold">{email}</span>, you will find a secure authorization link ready.
            </p>
            <p className="text-xs text-purple-400/60">
              Did not receive it? Check your spam folder or wait a few moments before trying again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
