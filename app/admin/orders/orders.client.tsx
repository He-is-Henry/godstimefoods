"use client";

import { getAdminOrders } from "@/lib/orders";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
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

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await getAdminOrders();
      setOrders(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load admin orders";
      toast.error(msg);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = () => fetchOrders();

    fetchInitialData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toString().includes(searchLower) ||
      order.customer.firstName.toLowerCase().includes(searchLower) ||
      order.customer.lastName.toLowerCase().includes(searchLower) ||
      (order.customer.phone && order.customer.phone.includes(searchLower)) ||
      order.deliveryAddress.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-xs text-slate-400 font-medium">Fetching customer orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor incoming customer orders, contact info, and delivery details
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedStatus === status
                ? "bg-purple-600 text-white shadow-md shadow-purple-950"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/80 text-slate-400 space-y-2">
          <p className="text-sm font-semibold text-slate-300">No orders found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
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

                {/* Customer & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <User className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Customer
                      </span>
                      <p className="font-bold text-white">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">{order.customer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <Phone className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Contact Phone
                      </span>
                      {order.customer.phone ? (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="font-bold text-pink-300 hover:underline"
                        >
                          {order.customer.phone}
                        </a>
                      ) : (
                        <span className="text-slate-500 italic">No phone attached</span>
                      )}
                    </div>
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

                {/* Items */}
                <div className="space-y-2 pt-1">
                  {order.items.map((item) => {
                    const imgUrl = item.product.images?.[0]?.url;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative h-9 w-9 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {imgUrl ? (
                              <Image
                                src={imgUrl}
                                alt={item.product.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              <ShoppingBag className="h-4 w-4 text-slate-700" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {item.product.name}
                            </p>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
