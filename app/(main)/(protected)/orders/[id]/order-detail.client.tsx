"use client";

import PaymentModal from "@/components/orders/PaymentModal";
import { ApiError } from "@/lib/apiClient";
import { cancelOrder, getCode, getOrder } from "@/lib/orders";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
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
  orderId: number;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modals
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const fetchOrder = async () => {
    try {
      const data = await getOrder(orderId);
      setOrder(data);
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
    const init = () => fetchOrder();
    if (orderId) init();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setActionLoading(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      toast.success("Order cancelled successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to cancel order");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetDeliveryCode = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await getCode(order.id);
      setActiveCode(res.code);
      setOrder(res.order);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to generate delivery code");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getProductImage = (images: OrderProductSummary["images"]): string | null => {
    if (Array.isArray(images)) return images[0]?.url || null;
    if (images && typeof images === "object" && "item" in images && Array.isArray(images.item)) {
      return images.item[0]?.url || null;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-xs text-slate-400 font-medium">Loading order #{orderId}...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">Order not found</h1>
        <p className="text-xs text-slate-400">
          The requested order does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-950/40"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Back Navigation */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* Main Order Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-black/40">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-white">Order #{order.id}</h1>
              <span
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {config.label}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
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
            <p className="text-xs text-slate-400">Placed on {formattedDate}</p>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Total Amount
            </span>
            <p className="text-2xl font-black text-purple-300">
              ₦{order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Address & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Delivery Address
              </span>
              <p className="text-white font-medium mt-0.5">{order.deliveryAddress}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Need Help?
            </span>
            <a
              href="tel:09034830924"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-xs transition-colors"
            >
              <Phone className="h-4 w-4" /> Call Customer Support
            </a>
          </div>
        </div>

        {/* Order Items List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Order Items ({order.items.length})
          </h2>
          <div className="space-y-2">
            {order.items.map((item) => {
              const imgUrl = getProductImage(item.product.images);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-slate-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-400">
                        ₦{item.unitPrice.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-purple-200 shrink-0">
                    ₦{(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Section */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Show Delivery Code */}
            {order.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={handleGetDeliveryCode}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                Show Delivery Code
              </button>
            )}

            {/* Pay / Bank Info Button */}
            {order.paid === "UNPAID" && order.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CreditCard className="h-3.5 w-3.5" /> Pay / Bank Info
              </button>
            )}

            {/* Cancel Order */}
            {order.status === "PENDING" && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 text-red-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && order && (
        <PaymentModal
          order={order}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updatedOrder) => setOrder(updatedOrder)}
        />
      )}

      {/* Customer Delivery Code Modal */}
      {activeCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 space-y-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-pink-400 font-bold text-base border-b border-slate-800 pb-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Delivery Security Code</span>
            </div>

            <p className="text-xs text-slate-300">
              Provide this 4-digit code to the delivery rider when receiving Order #{order.id}.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 tracking-widest text-4xl font-extrabold text-pink-400 font-mono shadow-inner">
              {activeCode}
            </div>

            <p className="text-[11px] text-amber-400/90 italic">
              Do not share this code until you inspect and accept your food delivery.
            </p>

            <button
              type="button"
              onClick={() => setActiveCode(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
