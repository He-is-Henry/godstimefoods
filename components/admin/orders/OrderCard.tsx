"use client";

import { ApiError } from "@/lib/apiClient";
import {
  adminCancelOrder,
  assignOrder,
  claimOrder,
  confirmOrder,
  markOutForDelivery,
  releaseOrder,
  reviveOrder,
  verifyOrderPayment,
} from "@/lib/orders";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  RotateCcw,
  ShoppingBag,
  Truck,
  User,
  UserCheck,
  UserMinus,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: CheckCircle2,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/20",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: XCircle,
  },
};

interface StaffOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface OrderCardProps {
  order: AdminOrder;
  currentUser: User | null;
  adminUsers: StaffOption[];
  onUpdate: (updated: AdminOrder) => void;
  onOpenDeliveryModal: (orderId: number, customerName: string) => void;
}

export default function OrderCard({
  order,
  currentUser,
  adminUsers,
  onUpdate,
  onOpenDeliveryModal,
}: OrderCardProps) {
  const [loading, setLoading] = useState(false);

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;

  const isAdmin = currentUser?.role === "ADMIN";
  const assignedUserId = order.assignedTo?.id ?? order.assignedToId;
  const isAssignedToMe = assignedUserId === currentUser?.id;
  const isPrivileged = isAdmin || isAssignedToMe;

  const canConfirm = order.status === "PENDING";
  const canClaim = order.status !== "DELIVERED" && !isAssignedToMe && assignedUserId === null;
  const canRelease = isAssignedToMe;
  const canVerifyPayment = order.paid !== "VERIFIED";
  const canMarkOutForDelivery = order.status === "CONFIRMED" && isPrivileged;
  const canDeliver = order.status === "OUT_FOR_DELIVERY" && isPrivileged && order.paid === "VERIFIED";
  const canCancel = isAdmin || order.status === "PENDING" || isAssignedToMe;
  const canRevive = isAdmin && order.status === "CANCELLED";

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getProductImage = (images: OrderProductSummary["images"]): string | null => {
    if (Array.isArray(images)) return images[0]?.url || null;
    if (images && typeof images === "object" && "item" in images && Array.isArray(images.item)) {
      return images.item[0]?.url || null;
    }
    return null;
  };

  const handleAction = async (actionFn: () => Promise<AdminOrder>, successMsg: string) => {
    setLoading(true);
    try {
      const updated = await actionFn();
      onUpdate(updated);
      toast.success(successMsg);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        const msg = err instanceof Error ? err.message : "Action failed";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4 backdrop-blur-xl transition-all hover:border-purple-500/30 shadow-lg shadow-black/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">Order #{order.id}</span>
            <span
              className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
            >
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                order.paid === "VERIFIED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : order.paid === "PENDING_VERIFICATION"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {order.paid === "VERIFIED"
                ? "Paid & Verified"
                : order.paid === "PENDING_VERIFICATION"
                ? "Payment Pending Verification"
                : "Unpaid"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Total Amount
            </span>
            <p className="text-base font-extrabold text-purple-300">
              ₦{order.totalAmount.toLocaleString()}
            </p>
          </div>

          <Link
            href={`/admin/orders/${order.id}`}
            className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-900/50 transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <span>Audit</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-start gap-2 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <User className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Customer</span>
            <p className="font-bold text-white">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-[11px] text-slate-400">{order.customer.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <Phone className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
            {order.customer.phone ? (
              <a href={`tel:${order.customer.phone}`} className="font-bold text-pink-300 hover:underline">
                {order.customer.phone}
              </a>
            ) : (
              <span className="text-slate-500 italic">No phone attached</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <UserCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Staff</span>
            {isAssignedToMe ? (
              <span className="font-bold text-emerald-400">Assigned to You</span>
            ) : order.assignedTo ? (
              <span className="font-bold text-slate-200 truncate block">
                {order.assignedTo.firstName} {order.assignedTo.lastName}
              </span>
            ) : (
              <span className="text-slate-500 italic block">Unassigned</span>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
        <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivery Address</span>
          <span>{order.deliveryAddress}</span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="space-y-2 pt-1">
        {order.items.map((item) => {
          const imgUrl = getProductImage(item.product.images);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-8 w-8 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {imgUrl ? (
                    <Image src={imgUrl} alt={item.product.name} fill sizes="32px" className="object-cover" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 text-slate-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                  <p className="text-[10px] text-slate-400">
                    ₦{item.unitPrice.toLocaleString()} × {item.quantity}
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-200 shrink-0">
                ₦{(item.unitPrice * item.quantity).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Toolbar */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        {loading ? (
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold px-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...
          </div>
        ) : (
          <>
            {/* Staff Selector Dropdown */}
            {isAdmin && adminUsers.length > 0 && (
              <select
                value={assignedUserId ?? ""}
                onChange={(e) => {
                  const targetId = Number(e.target.value);
                  if (targetId) {
                    handleAction(() => assignOrder(order.id, targetId), "Staff assigned successfully!");
                  }
                }}
                disabled={loading}
                className="bg-slate-950 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="" disabled>
                  -- Assign Staff --
                </option>
                {adminUsers.map((staff) => (
                  <option key={staff.id} value={staff.id} className="bg-slate-900 text-white">
                    {staff.firstName} {staff.lastName}
                  </option>
                ))}
              </select>
            )}

            {canConfirm && (
              <button
                type="button"
                onClick={() => handleAction(() => confirmOrder(order.id), "Order confirmed!")}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Confirm Order
              </button>
            )}

            {canClaim && (
              <button
                type="button"
                onClick={() => handleAction(() => claimOrder(order.id), "Order claimed!")}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <UserCheck className="h-3.5 w-3.5" /> Claim
              </button>
            )}

            {canRelease && (
              <button
                type="button"
                onClick={() => handleAction(() => releaseOrder(order.id), "Order released!")}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
              >
                <UserMinus className="h-3.5 w-3.5" /> Release
              </button>
            )}

            {canVerifyPayment && (
              <button
                type="button"
                onClick={() => handleAction(() => verifyOrderPayment(order.id), "Payment verified!")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <CreditCard className="h-3.5 w-3.5" /> Verify Payment
              </button>
            )}

            {canMarkOutForDelivery && (
              <button
                type="button"
                onClick={() => handleAction(() => markOutForDelivery(order.id), "Dispatched!")}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Truck className="h-3.5 w-3.5" /> Dispatch
              </button>
            )}

            {canDeliver && (
              <button
                type="button"
                onClick={() => onOpenDeliveryModal(order.id, order.customer.firstName)}
                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <KeyRound className="h-3.5 w-3.5" /> Enter Delivery Code
              </button>
            )}

            {canCancel && order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <button
                type="button"
                onClick={() => handleAction(() => adminCancelOrder(order.id), "Order cancelled.")}
                className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}

            {canRevive && (
              <button
                type="button"
                onClick={() => handleAction(() => reviveOrder(order.id), "Order revived!")}
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Revive
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
