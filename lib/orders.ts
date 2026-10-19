import { apiClient } from "./apiClient";

// customers
export const createOrder = (payload: CreateOrderPayload) =>
  apiClient.post<Order>("/orders", payload);

export const getOrders = () => apiClient.get<Order[]>("/orders");

export const getOrder = (id: number) => apiClient.get<Order>(`/orders/${id}`);

export const updateOrder = (id: number, data: { note: string }) =>
  apiClient.patch<Order>(`/orders/${id}`, data);

export const cancelOrder = (id: number) =>
  apiClient.patch<Order>(`/orders/${id}/cancel`);

export const claimPayment = (id: number) =>
  apiClient.patch<Order>(`/orders/${id}/paid`);

export const getCode = (id: number) =>
  apiClient.patch<{ code: string; order: Order }>(`/orders/${id}/code`);

// admins and managers
export interface PaginatedAdminOrders {
  data: AdminOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAdminOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status && params.status !== "ALL")
    searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  return apiClient.get<PaginatedAdminOrders>(
    `/admin/orders${query ? `?${query}` : ""}`,
  );
};
export const getAdminOrder = (id: number) =>
  apiClient.get<AdminOrder>(`/admin/orders/${id}`);

export const confirmOrder = (id: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/confirm`);

export const assignOrder = (id: number, assignedToId: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/assign/`, {
    assignedToId,
  });

export const claimOrder = (id: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/claim`);

export const releaseOrder = (id: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/release`);

export const adminCancelOrder = (id: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/cancel`);

export const reviveOrder = (id: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/revive`);

export const verifyOrderPayment = (id: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/paid`);

export const markOutForDelivery = (id: number) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/out-for-delivery`);

export const deliverOrder = (id: number, code: string) =>
  apiClient.patch<AdminOrder>(`/admin/orders/${id}/deliver`, {
    code,
  });
