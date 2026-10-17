"use client";

import DeliveryModal from "@/components/admin/orders/DeliveryModal";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import {
  adminCancelOrder,
  assignOrder,
  claimOrder,
  confirmOrder,
  getAdminOrder,
  markOutForDelivery,
  releaseOrder,
  reviveOrder,
  verifyOrderPayment,
} from "@/lib/orders";
import { useAdminUsersQuery } from "@/queries/admins";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  UserCheck,
  UserMinus,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

interface OrderDetailClientProps {
  id: number;
}

export default function OrderDetailClient({ id }: OrderDetailClientProps) {
  const { user } = useAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const { data: adminUsersRes } = useAdminUsersQuery.adminUsers(1, 100, ["ADMIN", "MANAGER"]);
  const adminUsers = adminUsersRes?.data ?? [];

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrder(id);
      setOrder(res);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load order details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = () => fetchDetail();

    init();
  }, [id]);

  const handleAction = async (actionFn: () => Promise<AdminOrder>, successMsg: string) => {
    setActionLoading(true);
    try {
      const updated = await actionFn();
      setOrder(updated);
      toast.success(successMsg);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        const msg = err instanceof Error ? err.message : "Action failed";
        toast.error(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-xs text-slate-400 font-medium">Fetching order audit details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-400 text-sm">Order #{id} could not be found.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;

  const isAdmin = user?.role === "ADMIN";
  const assignedUserId = order.assignedTo?.id ?? order.assignedToId;
  const isAssignedToMe = assignedUserId === user?.id;
  const isPrivileged = isAdmin || isAssignedToMe;

  const canCancel = isAdmin || order.status === "PENDING" || isAssignedToMe;

  const getProductImage = (images: OrderProductSummary["images"]): string | null => {
    if (Array.isArray(images)) return images[0]?.url || null;
    if (images && typeof images === "object" && "item" in images && Array.isArray(images.item)) {
      return images.item[0]?.url || null;
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Order Audit #{order.id}
            </h1>
            <span
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchDetail()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload
        </button>
      </div>

      {/* Main Grid: Audit Personnel Log & Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="h-4 w-4 text-purple-400" /> Customer Details
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Name</span>
              <p className="font-bold text-white text-sm">
                {order.customer.firstName} {order.customer.lastName}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Email</span>
              <p className="text-slate-300">{order.customer.email}</p>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Phone</span>
              {order.customer.phone ? (
                <a href={`tel:${order.customer.phone}`} className="font-bold text-pink-300 hover:underline">
                  {order.customer.phone}
                </a>
              ) : (
                <span className="text-slate-500 italic">No phone attached</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-500 text-[10px] uppercase font-semibold mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-purple-400" /> Delivery Address
              </span>
              <p className="text-slate-200 font-medium">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Audit Personnel Log */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Staff Fulfillment Audit
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 col-span-2">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">
                Assigned Staff Member
              </span>
              {isAdmin && adminUsers.length > 0 ? (
                <select
                  value={assignedUserId ?? ""}
                  onChange={(e) => {
                    const targetId = Number(e.target.value);
                    if (targetId) {
                      handleAction(() => assignOrder(order.id, targetId), "Staff assigned successfully!");
                    }
                  }}
                  disabled={actionLoading}
                  className="w-full bg-slate-900 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500 cursor-pointer mt-1"
                >
                  <option value="" disabled>
                    -- Assign Staff Member --
                  </option>
                  {adminUsers.map((staff) => (
                    <option key={staff.id} value={staff.id} className="bg-slate-900 text-white">
                      {staff.firstName} {staff.lastName} ({staff.email})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-bold text-white mt-1">
                  {order.assignedTo ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}` : "Unassigned"}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Confirmed By</span>
              <p className="font-bold text-white mt-1">
                {order.confirmedBy ? `${order.confirmedBy.firstName} ${order.confirmedBy.lastName}` : "None"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Payment Verified By</span>
              <p className="font-bold text-white mt-1">
                {order.paidBy ? `${order.paidBy.firstName} ${order.paidBy.lastName}` : "Unverified"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 col-span-2">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Delivered By</span>
              <p className="font-bold text-white mt-1">
                {order.deliveredBy ? `${order.deliveredBy.firstName} ${order.deliveredBy.lastName}` : "Pending"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Items */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Purchased Items</h2>

        <div className="space-y-3">
          {order.items.map((item) => {
            const imgUrl = getProductImage(item.product.images);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={item.product.name} fill sizes="48px" className="object-cover" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-slate-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{item.product.name}</p>
                    <p className="text-xs text-slate-400">
                      ₦{item.unitPrice.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                </div>

                <p className="text-sm font-extrabold text-purple-300">
                  ₦{(item.unitPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-sm font-extrabold text-white">
          <span>Total Order Value</span>
          <span className="text-lg text-purple-300">₦{order.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">Order Actions:</span>

        {actionLoading ? (
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {order.status === "PENDING" && (
              <button
                type="button"
                onClick={() => handleAction(() => confirmOrder(order.id), "Order confirmed!")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Confirm Order
              </button>
            )}

            {!isAssignedToMe && assignedUserId === null && order.status !== "DELIVERED" && (
              <button
                type="button"
                onClick={() => handleAction(() => claimOrder(order.id), "Order claimed!")}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="h-4 w-4" /> Claim Order
              </button>
            )}

            {isAssignedToMe && (
              <button
                type="button"
                onClick={() => handleAction(() => releaseOrder(order.id), "Order released!")}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserMinus className="h-4 w-4" /> Release Assignment
              </button>
            )}

            {order.paid !== "VERIFIED" && (
              <button
                type="button"
                onClick={() => handleAction(() => verifyOrderPayment(order.id), "Payment verified!")}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="h-4 w-4" /> Verify Payment
              </button>
            )}

            {order.status === "CONFIRMED" && isPrivileged && (
              <button
                type="button"
                onClick={() => handleAction(() => markOutForDelivery(order.id), "Dispatched!")}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Truck className="h-4 w-4" /> Dispatch
              </button>
            )}

            {order.status === "OUT_FOR_DELIVERY" && isPrivileged && order.paid === "VERIFIED" && (
              <button
                type="button"
                onClick={() => setShowDeliveryModal(true)}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="h-4 w-4" /> Enter Delivery Code
              </button>
            )}

            {canCancel && order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <button
                type="button"
                onClick={() => handleAction(() => adminCancelOrder(order.id), "Order cancelled.")}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel Order
              </button>
            )}

            {isAdmin && order.status === "CANCELLED" && (
              <button
                type="button"
                onClick={() => handleAction(() => reviveOrder(order.id), "Order revived!")}
                className="px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" /> Revive Order
              </button>
            )}
          </div>
        )}
      </div>

      <DeliveryModal
        orderId={showDeliveryModal ? order.id : null}
        customerName={order.customer.firstName}
        onClose={() => setShowDeliveryModal(false)}
        onSuccess={(updated) => setOrder(updated)}
      />
    </div>
  );
}
