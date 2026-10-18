import { apiClient } from "./apiClient";

export const getMessages = (unreadOnly?: boolean, page = 1, limit = 20) =>
  apiClient.get<Message[]>(
    `messages?page=${page}&limit=${limit}${unreadOnly ? "&unreadOnly=true" : ""}`,
  );

export const getUnreadCount = () =>
  apiClient.get<{ count: number }>("messages/count");

export const readMessage = (id: number) =>
  apiClient.patch(`messages/${id}/read`);

export const markAllAsRead = () => apiClient.patch("messages/read/all");
