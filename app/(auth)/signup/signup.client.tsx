"use client";

import { useAuth } from "@/context/AuthContext";
import { signup } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, SubmitEvent } from "react";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";
import Link from "next/link";

export default function SignupClient() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromQuery = searchParams.get("from");
  const redirectTo = fromQuery || "/";
  const searchString = fromQuery ? `?from=` + encodeURIComponent(fromQuery) : "";

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    const allCriteriaMet = passwordRequirements.every((req) => req.met);
    if (!allCriteriaMet) {
      toast.error("Please meet all password security requirements");
      return;
    }

    try {
      setLoading(true);
      const data = await signup({ firstName, lastName, email, password });
      setAuth(data);
      toast.success("Account created successfully!");
      router.replace(redirectTo);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-950/50">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <h3 className="text-sm text-purple-300/80 mt-1">Join us today</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
            <p className="text-xs font-semibold text-purple-300 tracking-wide uppercase">
              Password Criteria:
            </p>
            <ul className="space-y-1.5 text-xs">
              {passwordRequirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span
                    className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${req.met
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                  >
                    {req.met ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                  </span>
                  <span className={req.met ? "text-purple-100 font-medium" : "text-purple-400/60"}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-40" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30" strokeDashoffset="20"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-purple-300/70">
            Already have an account?{" "}
            <Link href={"/login" + searchString} className="text-pink-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
