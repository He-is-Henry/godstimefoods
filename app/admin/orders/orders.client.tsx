"use client";

import DeliveryModal from "@/components/admin/orders/DeliveryModal";
import OrderCard from "@/components/admin/orders/OrderCard";
import OrderFilterBar from "@/components/admin/orders/OrderFilterBar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import { getAdminOrders } from "@/lib/orders";
import { useAdminUsersQuery } from "@/queries/admins";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminOrdersClient() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [deliveryTarget, setDeliveryTarget] = useState<{ id: number; name: string } | null>(null);

  const { data: adminUsersRes } = useAdminUsersQuery.adminUsers(1, 100, ["ADMIN", "MANAGER"]);
  const adminUsers = adminUsersRes?.data ?? [];

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await getAdminOrders();
      setOrders(res);
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
    const init = () => fetchOrders();

    init();
  }, []);

  const handleUpdateOrder = (updated: AdminOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

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
        <p className="text-xs text-slate-400 font-medium">Loading orders list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer purchases, dispatch assignments, and transition order lifecycle statuses
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh List
        </button>
      </div>

      <OrderFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/80 text-slate-400 space-y-2">
          <p className="text-sm font-semibold text-slate-300">No matching orders found</p>
          <p className="text-xs text-slate-500">Try adjusting search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              currentUser={user}
              adminUsers={adminUsers}
              onUpdate={handleUpdateOrder}
              onOpenDeliveryModal={(id, name) => setDeliveryTarget({ id, name })}
            />
          ))}
        </div>
      )}

      <DeliveryModal
        orderId={deliveryTarget?.id ?? null}
        customerName={deliveryTarget?.name}
        onClose={() => setDeliveryTarget(null)}
        onSuccess={handleUpdateOrder}
      />
    </div>
  );
}
