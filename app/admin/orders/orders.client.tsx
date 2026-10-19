"use client";

import DeliveryModal from "@/components/admin/orders/DeliveryModal";
import OrderCard from "@/components/admin/orders/OrderCard";
import OrderFilterBar from "@/components/admin/orders/OrderFilterBar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import { getAdminOrders } from "@/lib/orders";
import { useAdminUsersQuery } from "@/queries/admins";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminOrdersClient() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Pagination & Filter States
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [deliveryTarget, setDeliveryTarget] = useState<{ id: number; name: string } | null>(null);

  const { data: adminUsersRes } = useAdminUsersQuery.adminUsers(1, 100, ["ADMIN", "MANAGER"]);
  const adminUsers = adminUsersRes?.data ?? [];

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await getAdminOrders({
        page,
        limit: 15,
        status: selectedStatus,
        search: searchQuery,
      });
      setOrders(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalOrders(res.meta.total);
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

  // Re-fetch when page or filters change
  useEffect(() => {
    const init = () => fetchOrders();

    init();
  }, [page, selectedStatus, searchQuery]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to page 1 on search change
  };

  const handleUpdateOrder = (updated: AdminOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

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
            Total orders found: <span className="text-purple-400 font-semibold">{totalOrders}</span>
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
        setSearchQuery={handleSearchChange}
        selectedStatus={selectedStatus}
        setSelectedStatus={handleStatusChange}
      />

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/80 text-slate-400 space-y-2">
          <p className="text-sm font-semibold text-slate-300">No matching orders found</p>
          <p className="text-xs text-slate-500">Try adjusting search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
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