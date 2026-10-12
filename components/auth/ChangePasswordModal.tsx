"use client";

import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/lib/auth";
import { Check, Eye, EyeOff, Loader2, Lock, ShieldAlert, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";

type ChangePasswordModalProps = {
  isOpen: boolean;
  isForced?: boolean;
  onClose: () => void;
};

// SSR-safe client mounting check to eliminate cascading re-renders and ESLint errors
const emptySubscribe = () => () => { };
const useIsMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

export default function ChangePasswordModal({
  isOpen,
  isForced = false,
  onClose,
}: ChangePasswordModalProps) {
  const { user, setAuth } = useAuth();
  const isMounted = useIsMounted();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !isMounted) return null;

  const passwordRequirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "At least one lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "At least one number", met: /[0-9]/.test(newPassword) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const allCriteriaMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword || !currentPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!allCriteriaMet) {
      toast.error("Please meet all password security requirements");
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword({
        currentPassword,
        password: newPassword,
      });

      if (response?.user) {
        setAuth({ user: response.user });
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to change password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-100 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-slate-900 p-6 space-y-5 shadow-2xl shadow-purple-950/50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${isForced
                ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                : "bg-purple-600/20 border border-purple-500/30 text-pink-400"
                }`}
            >
              {isForced ? <ShieldAlert className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isForced ? "Security Notice" : "Change Password"}
              </h3>
              <p className="text-xs text-purple-300/70">
                {isForced
                  ? "You must update your default password to continue."
                  : "Update your password to keep your account secure."}
              </p>
            </div>
          </div>

          {!isForced && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden username input so browser password managers prompt 'Save Password?' for this user */}
          <input
            type="text"
            name="username"
            value={user?.email || ""}
            readOnly
            className="hidden"
            autoComplete="username"
          />

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1 uppercase tracking-wider">
              Current Password <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                name="current-password"
                autoComplete="current-password"
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-purple-500/30 bg-slate-950 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1 uppercase tracking-wider">
              New Password <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="new-password"
                autoComplete="new-password"
                required
                placeholder="Strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-purple-500/30 bg-slate-950 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1 uppercase tracking-wider">
              Confirm New Password <span className="text-pink-400">*</span>
            </label>
            <input
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-purple-500/30 bg-slate-950 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
            <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
              Password Security Checklist:
            </p>
            <ul className="space-y-1.5 text-[11px]">
              {passwordRequirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span
                    className={`flex items-center justify-center w-3.5 h-3.5 rounded-full transition-colors ${req.met
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                  >
                    {req.met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                  </span>
                  <span className={req.met ? "text-purple-100 font-medium" : "text-purple-400/60"}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            {!isForced && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !allCriteriaMet}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}