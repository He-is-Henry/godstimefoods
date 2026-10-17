"use client";

import { ApiError } from "@/lib/apiClient";
import { deliverOrder } from "@/lib/orders";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface DeliveryModalProps {
  orderId: number | null;
  customerName?: string;
  initialLockedUntil?: string | null;
  onClose: () => void;
  onSuccess: (updatedOrder: AdminOrder) => void;
}

function calculateRemainingSeconds(lockedUntilIso?: string | null): number {
  if (!lockedUntilIso) return 0;
  const lockTime = new Date(lockedUntilIso).getTime();
  return Math.max(0, Math.ceil((lockTime - Date.now()) / 1000));
}

export default function DeliveryModal({
  orderId,
  customerName = "Customer",
  initialLockedUntil,
  onClose,
  onSuccess,
}: DeliveryModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    calculateRemainingSeconds(initialLockedUntil)
  );
  const [prevLockedUntil, setPrevLockedUntil] = useState(initialLockedUntil);

  if (initialLockedUntil !== prevLockedUntil) {
    setPrevLockedUntil(initialLockedUntil);
    setRemainingSeconds(calculateRemainingSeconds(initialLockedUntil));
  }

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  if (!orderId) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim() || remainingSeconds > 0) return;

    setLoading(true);
    try {
      const updatedOrder = await deliverOrder(orderId, code.trim());
      toast.success("Order marked as Delivered!");
      onSuccess(updatedOrder);
      onClose();
    } catch (err) {
      setCode("");
      if (err instanceof ApiError) {
        const data = err.data as
          | { confirmationLockedUntil?: string; message?: string }
          | undefined;

        if (data?.confirmationLockedUntil) {
          setRemainingSeconds(calculateRemainingSeconds(data.confirmationLockedUntil));
        }

        const toastMsg =
          typeof data?.message === "string"
            ? data.message
            : err.message || "Invalid delivery code";

        toast.error(toastMsg);
      } else {
        const msg = err instanceof Error ? err.message : "Invalid delivery code";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 space-y-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl"
      >
        <div className="flex items-center gap-2 text-pink-400 font-bold text-base border-b border-slate-800 pb-3">
          <KeyRound className="h-5 w-5" />
          <span>Confirm Delivery #{orderId}</span>
        </div>

        <p className="text-xs text-slate-300">
          Enter the 4-digit security code provided by{" "}
          <strong className="text-white">{customerName}</strong>.
        </p>

        {remainingSeconds > 0 ? (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400">
              <ShieldAlert className="h-4 w-4" /> Input Locked
            </div>
            <p className="text-[11px] text-slate-300">
              Too many failed attempts. Try again in:
            </p>
            <div className="text-xl font-mono font-extrabold text-red-400">
              {formatTime(remainingSeconds)}
            </div>
          </div>
        ) : (
          <input
            type="text"
            maxLength={4}
            required
            autoFocus
            placeholder="0000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center text-2xl font-extrabold tracking-widest px-4 py-3 rounded-xl bg-slate-950 border border-purple-500/40 text-white focus:outline-none focus:border-pink-500"
          />
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || code.length !== 4 || remainingSeconds > 0}
            className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Verify & Complete
          </button>
        </div>
      </form>
    </div>
  );
}