import { apiClient } from "./apiClient";

export const createOrder = (payload: CreateOrderPayload) =>
  apiClient.post<Order>("/orders", payload);

export const getOrders = () => apiClient.get<Order[]>("/orders");

export const getAdminOrders = () =>
  apiClient.get<AdminOrder[]>("/orders/admin");
