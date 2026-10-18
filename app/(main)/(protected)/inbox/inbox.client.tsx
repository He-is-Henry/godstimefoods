"use client";

import { ApiError } from "@/lib/apiClient";
import { getMessages, markAllAsRead, readMessage } from "@/lib/messages";
import {
  CheckCircle2,
  CheckCheck,
  ChevronRight,
  Inbox as InboxIcon,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type TabType = "unread" | "all";

const ACTION_CONFIG: Record<
  Message["action"],
  { label: string; bg: string; text: string; border: string; icon: React.ElementType; description: string }
> = {
  ORDER_CONFIRMED: {
    label: "Order Confirmed",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: CheckCircle2,
    description: "Your order has been confirmed and sent to the kitchen.",
  },
  ORDER_OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/20",
    icon: Truck,
    description: "Rider is en route! Tap to view details and get your delivery code.",
  },
  ORDER_DELIVERED: {
    label: "Order Delivered",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: PackageCheck,
    description: "Your order was successfully delivered. Enjoy your meal!",
  },
  ORDER_CANCELLED: {
    label: "Order Cancelled",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: XCircle,
    description: "Your order was cancelled. Tap to check order status.",
  },
  ORDER_REVIVED: {
    label: "Order Restored",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: RotateCcw,
    description: "Your order has been reactivated and restored to pending state.",
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: ShieldCheck,
    description: "Your bank transfer has been verified and approved by our team.",
  },
};

export default function InboxClient() {
  const [activeTab, setActiveTab] = useState<TabType>("unread");
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const fetchMessagesList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await getMessages(activeTab === "unread");

      const list: Message[] = Array.isArray(res)
        ? res
        : (res as unknown as { data: Message[] })?.data || [];

      const unreadTotal = (!Array.isArray(res) && (res as unknown as { meta?: { unreadCount?: number } })?.meta?.unreadCount !== undefined)
        ? (res as unknown as { meta: { unreadCount: number } }).meta.unreadCount
        : list.filter((m) => !m.read).length;

      setMessages(list);
      setUnreadCount(unreadTotal);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load inbox messages");
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = () => fetchMessagesList();
    init();
  }, [activeTab]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      toast.success("All messages marked as read");

      if (activeTab === "unread") {
        setMessages([]);
      } else {
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      }
      setUnreadCount(0);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to mark all messages as read");
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMessageClick = async (msg: Message) => {
    if (!msg.read) {
      try {
        await readMessage((msg as Message & { id?: number }).id || msg.orderId);
        setMessages((prev) =>
          prev.map((m) =>
            m === msg ? { ...m, read: true } : m
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark message read:", err);
      }
    }
  };

  const getProductImage = (images: OrderProductSummary["images"]): string | null => {
    if (Array.isArray(images)) return images[0]?.url || null;
    if (images && typeof images === "object" && "item" in images && Array.isArray(images.item)) {
      return images.item[0]?.url || null;
    }
    return null;
  };

  const getItemSummary = (items: OrderItem[]): string => {
    if (!items || items.length === 0) return "Food Order";
    const firstItem = items[0].product.name;
    const count = items.length - 1;
    if (count > 0) {
      return `${firstItem} and ${count} other item${count > 1 ? "s" : ""}`;
    }
    return firstItem;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Inbox Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Inbox</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-pink-600/20 text-pink-400 border border-pink-500/30 text-xs font-bold animate-pulse">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Order updates, payment verifications, and delivery status alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-3.5 w-3.5 text-pink-400" /> Mark all read
          </button>
          <button
            type="button"
            onClick={() => fetchMessagesList(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 text-xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh inbox"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "unread"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
        >
          Unread
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "all"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
        >
          All Notifications
        </button>
      </div>

      {/* Skeleton Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 bg-slate-800 rounded" />
                    <div className="h-3 w-16 bg-slate-850 rounded" />
                  </div>
                  <div className="h-3 w-3/4 bg-slate-850 rounded" />
                  <div className="h-3 w-1/2 bg-slate-850 rounded" />
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-800 shrink-0" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        /* Empty Inbox View */
        <div className="py-16 text-center space-y-4 bg-slate-900/30 rounded-2xl border border-slate-800/60 p-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <InboxIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">
              {activeTab === "unread" ? "No unread messages" : "Your inbox is empty"}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {activeTab === "unread"
                ? "You're all caught up! Switch to 'All Notifications' to view order history alerts."
                : "When you place food orders or make payment transfers, notifications will appear here."}
            </p>
          </div>
        </div>
      ) : (
        /* Messages List */
        <div className="space-y-3">
          {messages.map((msg, index) => {
            const config = ACTION_CONFIG[msg.action] || ACTION_CONFIG.ORDER_CONFIRMED;
            const ActionIcon = config.icon;
            const firstItemImage = msg.order?.items?.[0]
              ? getProductImage(msg.order.items[0].product.images)
              : null;
            const summaryText = msg.order?.items
              ? getItemSummary(msg.order.items)
              : "Food Order";

            const messageId = (msg as Message & { id?: number }).id || index;

            return (
              <Link
                key={messageId}
                href={`/orders/${msg.orderId}`}
                onClick={() => handleMessageClick(msg)}
                className={`group block rounded-2xl border p-4 transition-all duration-200 backdrop-blur-xl relative overflow-hidden ${!msg.read
                    ? "bg-slate-900/90 border-purple-500/40 shadow-lg shadow-purple-950/20 hover:border-pink-500/50"
                    : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100"
                  }`}
              >
                {/* Unread Accent Dot */}
                {!msg.read && (
                  <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-pink-500 ring-4 ring-pink-500/20 animate-pulse" />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Action Icon Badge */}
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${config.bg} ${config.text} ${config.border}`}
                    >
                      <ActionIcon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          Order #{msg.orderId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-200 leading-snug">
                        {config.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span className="truncate text-purple-300 font-semibold">
                          {summaryText}
                        </span>
                        {msg.order?.totalAmount && (
                          <span className="font-extrabold text-white">
                            ₦{msg.order.totalAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail / Arrow */}
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    {firstItemImage ? (
                      <div className="relative h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                        <Image
                          src={firstItemImage}
                          alt="Order Product"
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                    <ChevronRight className=" h-5 w-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
