"use client";

import { ApiError } from "@/lib/apiClient";
import { cancelOrder, claimPayment, getCode, getOrders } from "@/lib/orders";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  KeyRound,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
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

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modal State for Delivery Code
  const [activeCodeTarget, setActiveCodeTarget] = useState<{
    orderId: number;
    code: string;
  } | null>(null);

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load orders";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClaimPayment = async (orderId: number) => {
    setActionLoadingId(orderId);
    try {
      const updated = await claimPayment(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success("Payment status updated to pending verification!");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update payment status");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setActionLoadingId(orderId);
    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success("Order cancelled successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to cancel order");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleGetDeliveryCode = async (orderId: number) => {
    setActionLoadingId(orderId);
    try {
      const res = await getCode(orderId);
      setActiveCodeTarget({ orderId, code: res.code });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to generate delivery code");
      }
    } finally {
      setActionLoadingId(null);
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
        <p className="text-xs text-slate-400 font-medium">Fetching your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-950/40">
          <Package className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">No orders yet</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven&apos;t placed any food orders with Godstime Foods yet.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/30"
        >
          Explore Menu <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Orders</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active food deliveries and view purchase history
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
          const StatusIcon = config.icon;
          const isActionBusy = actionLoadingId === order.id;

          const formattedDate = new Date(order.createdAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4 backdrop-blur-xl transition-all hover:border-purple-500/30 shadow-lg shadow-black/20"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm font-extrabold text-white hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      Order #{order.id}
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
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

                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    Total Amount
                  </span>
                  <p className="text-base font-extrabold text-purple-300">
                    ₦{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Delivery Address
                  </span>
                  <span>{order.deliveryAddress}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2.5 pt-1">
                {order.items.map((item) => {
                  const imgUrl = getProductImage(item.product.images);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={item.product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
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

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 font-bold text-xs transition-all flex items-center gap-1"
                  >
                    View Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  {/* Delivery Code Action */}
                  {order.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() => handleGetDeliveryCode(order.id)}
                      disabled={isActionBusy}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isActionBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <KeyRound className="h-3.5 w-3.5" />
                      )}
                      Show Delivery Code
                    </button>
                  )}

                  {/* Claim Payment Action */}
                  {order.paid === "UNPAID" && order.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() => handleClaimPayment(order.id)}
                      disabled={isActionBusy}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> I Have Paid
                    </button>
                  )}

                  {/* Cancel Order Action */}
                  {order.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={isActionBusy}
                      className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 text-red-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                <a
                  href="tel:09034830924"
                  className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold transition-colors ml-auto"
                >
                  <Phone className="h-3.5 w-3.5" /> Contact Support
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Delivery Code Modal */}
      {activeCodeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 space-y-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-pink-400 font-bold text-base border-b border-slate-800 pb-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Delivery Security Code</span>
            </div>

            <p className="text-xs text-slate-300">
              Provide this 4-digit code to the delivery rider when receiving Order #{activeCodeTarget.orderId}.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 tracking-widest text-4xl font-extrabold text-pink-400 font-mono shadow-inner">
              {activeCodeTarget.code}
            </div>

            <p className="text-[11px] text-amber-400/90 italic">
              Do not share this code until you inspect and accept your food delivery.
            </p>

            <button
              type="button"
              onClick={() => setActiveCodeTarget(null)}
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
