"use client";

import { ApiError } from "@/lib/apiClient";
import { claimPayment } from "@/lib/orders";
import {
  Check,
  Copy,
  CreditCard,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const PRIMARY_ACCOUNT = {
  bankName: "OPay",
  accountNumber: "6118323736",
  accountName: "God's time 01 canteen & restaurant",
};

interface PaymentModalProps {
  order: Order | null;
  customerName?: string;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export default function PaymentModal({
  order,
  customerName = "Customer",
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!order) return null;

  // Extract first name for reference
  const firstName = customerName.trim().split(" ")[0] || "Customer";

  // Build items summary
  const firstItem = order.items[0]?.product.name || "Food Order";
  const otherCount = order.items.length - 1;
  const itemsSummary =
    otherCount > 0
      ? `${firstItem} and ${otherCount} other item${otherCount > 1 ? "s" : ""}`
      : firstItem;

  // Reference formula: {firstname} payment for order #{id} ({itemsSummary})
  const paymentReference = `${firstName} payment for order #${order.id} (${itemsSummary})`;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(PRIMARY_ACCOUNT.accountNumber);
    setCopiedAccount(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(paymentReference);
    setCopiedRef(true);
    toast.success("Payment reference copied!");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleClaimPayment = async () => {
    setLoading(true);
    try {
      const updated = await claimPayment(order.id);
      toast.success("Payment submitted! Waiting for admin verification.");
      onSuccess(updated);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update payment status");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 space-y-5 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl relative text-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-pink-400 font-bold text-base border-b border-slate-800 pb-3">
          <CreditCard className="h-5 w-5" />
          <span>Bank Transfer Details</span>
        </div>

        {/* Amount Box */}
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center space-y-1">
          <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
            Total Amount to Transfer
          </span>
          <div className="text-3xl font-extrabold text-white">
            ₦{order.totalAmount.toLocaleString()}
          </div>
        </div>

        {/* Bank Account Details Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Bank Name
              </span>
              <span className="text-sm font-bold text-white">
                {PRIMARY_ACCOUNT.bankName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Account Name
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {PRIMARY_ACCOUNT.accountName}
              </span>
            </div>
          </div>

          {/* Account Number Copy Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Account Number
              </span>
              <span className="text-xl font-mono font-extrabold text-pink-400 tracking-widest">
                {PRIMARY_ACCOUNT.accountNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyAccount}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-purple-500/30 hover:bg-purple-950/50 text-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedAccount ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Number
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment Reference Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-500">
              Transfer Remark / Reference
            </span>
            <button
              type="button"
              onClick={handleCopyRef}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {copiedRef ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copy Reference
                </span>
              )}
            </button>
          </div>
          <p className="text-xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-200 select-all break-all leading-relaxed">
            {paymentReference}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={handleClaimPayment}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-all shadow-lg shadow-pink-950/40 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            I Have Sent the Money
          </button>
          <p className="text-[10px] text-center text-slate-400">
            Notifies admins to verify your transfer against your order reference.
          </p>
        </div>
      </div>
    </div>
  );
}
