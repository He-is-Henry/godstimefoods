"use client";

import { useAuth } from "@/context/AuthContext";
import { login } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, SubmitEvent } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromQuery = searchParams.get("from");
  const redirectTo = fromQuery || "/";
  const searchString = fromQuery ? `?from=` + encodeURIComponent(fromQuery) : "";

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const data = await login({ email, password });
      console.log(data)
      setAuth(data);
      toast.success("Welcome back!");
      router.replace(redirectTo);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Invalid credentials";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-950/50">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Login</h2>
          <h3 className="text-sm text-purple-300/80 mt-1">Sign in to your account</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-purple-300/70">
            Don&apos;t have an account?{" "}
            <Link href={"/signup" + searchString} className="text-pink-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
