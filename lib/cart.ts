import { apiClient } from "./apiClient";

export const getCart = () => apiClient.get<CartItem[]>("/cart");

export const addItemToCart = (productId: number, quantity: number) =>
  apiClient.post<CartItem>("/cart", { productId, quantity });

export const updateCartItem = (id: number, quantity: number) =>
  apiClient.patch<CartItem>(`/cart/${id}`, {
    quantity,
  });

export const removeItemFromCart = (id: number) =>
  apiClient.delete(`/cart/${id}`);

const cartApi = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
};
export default cartApi;
