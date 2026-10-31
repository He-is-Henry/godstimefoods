"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Check, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { verifyToken, resetPassword } from "@/lib/auth";

interface UserProfileContext {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifyingToken, setVerifyingToken] = useState(true);
  const [profile, setProfile] = useState<UserProfileContext | null>(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Security authorization token missing from reset URL pipeline.");
      router.replace("/login");
      return;
    }

    const checkIncomingToken = async () => {
      try {
        const userData = await verifyToken(token);
        // Cast or pull properties from your parsed user response configuration
        setProfile(userData as unknown as UserProfileContext);
      } catch (err) {
        toast.error("This recovery loop signature has expired or is invalid.");
        router.replace("/forgot-password");
      } finally {
        setVerifyingToken(false);
      }
    };

    checkIncomingToken();
  }, [token, router]);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allCriteriaMet = passwordRequirements.every((req) => req.met);

    if (!allCriteriaMet) {
      toast.error("Please fulfill password complexity specifications.");
      return;
    }

    try {
      setSubmitting(true);
      if (!token) return;

      await resetPassword(token, password);
      toast.success("Password reset successfully! Proceeding to configuration.");
      router.replace("/login");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Reset pipeline update failure";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-purple-300">
          <Loader2 className="animate-spin h-8 w-8 text-pink-500" />
          <p className="text-sm tracking-wide">Validating security authorization signature...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-950/50">

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">Set New Password</h2>
          {profile && (
            <p className="text-sm text-purple-300/80 mt-2">
              Modifying settings for{" "}
              <span className="text-pink-400 font-medium">
                {profile.firstName} {profile.lastName}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
            <p className="text-xs font-semibold text-purple-300 tracking-wide uppercase">
              Password Criteria:
            </p>
            <ul className="space-y-1.5 text-xs">
              {passwordRequirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${req.met ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}>
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
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            {submitting ? "Saving changes..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
