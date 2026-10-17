"use client";

import { createAdminUser, Role } from "@/lib/admin-users";
import { Check, Eye, EyeOff, Loader2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

type UserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Failed to create user";
}

export default function UserModal({ isOpen, onClose, onSuccess }: UserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allCriteriaMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allCriteriaMet) {
      toast.error("Password does not meet required security criteria");
      return;
    }

    setLoading(true);
    try {
      await createAdminUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      });

      toast.success("User created! Default password set with forced reset.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("CUSTOMER");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Provision New Account</h3>
              <p className="text-xs text-slate-400">
                Created users will be prompted to change their temporary password upon initial login.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                First Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                autoComplete="off"
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Last Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={lastName}
                autoComplete="off"
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address <span className="text-purple-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="user@godstimefoods.com"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Role <span className="text-purple-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["CUSTOMER", "MANAGER", "ADMIN"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${role === r
                    ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/30"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Temporary Password <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Assign temporary password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Security Checklist */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Password Security Checklist
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
              {passwordRequirements.map((req, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span
                    className={`flex items-center justify-center w-3.5 h-3.5 rounded-full ${req.met
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-600 border border-slate-700"
                      }`}
                  >
                    {req.met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                  </span>
                  <span className={req.met ? "text-slate-200 font-medium" : "text-slate-500"}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !allCriteriaMet}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Provisioning..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
