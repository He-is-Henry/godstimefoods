"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, ArrowRight } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

export default function MustChangePasswordBanner() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user || !user.mustChangePassword) return null;

  return (
    <>
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Action Required:</strong> You are using a temporary password. Please update it to restore full account access.
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all cursor-pointer shrink-0"
          >
            <span>Change Password</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isModalOpen}
        isForced={true}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
