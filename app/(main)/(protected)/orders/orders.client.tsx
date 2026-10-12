"use client";

import { getOrders } from "@/lib/orders";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
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


  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      toast.error(msg);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    const initOrders = () => fetchOrders()

    initOrders();
  }, []);

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
                    <span className="text-sm font-extrabold text-white">Order #{order.id}</span>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
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
                  const imgUrl = item.product.images?.[0]?.url;
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
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className="text-slate-200">{config.label}</strong>
                </span>

                <a
                  href="tel:09034830924"
                  className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" /> Contact Support
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
