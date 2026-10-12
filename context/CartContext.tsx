'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import cartApi from '@/lib/cart';
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

type CartContextType = {
  addItemToCart(product: Product, quantity: number): Promise<void>;
  updateCartItem(id: number, quantity: number): Promise<void>;
  removeItemFromCart(id: number): Promise<void>;
  refreshCart(): Promise<void>;
  cart: CartItem[];
  count: number;
  loading: boolean;
  syncing: boolean;
};

type Props = {
  children: ReactNode;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_QUEUE_KEY = 'cart_queue';

const getLocalQueue = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CART_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCartLocally = (value: CartItem[]) => {
  if (typeof window === 'undefined') return;
  if (value.length === 0) {
    localStorage.removeItem(CART_QUEUE_KEY);
  } else {
    localStorage.setItem(CART_QUEUE_KEY, JSON.stringify(value));
  }
};

const CartContextProvider = ({ children }: Props) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(getLocalQueue);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const getCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to get cart";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Flush guest offline queue on login
  useEffect(() => {
    if (!isAuthenticated) return;

    const flushQueue = async () => {
      let currentQueue = getLocalQueue();
      if (currentQueue.length === 0) return;

      setSyncing(true);

      for (const item of [...currentQueue]) {
        try {
          await cartApi.addItemToCart(item.productId, item.quantity);
        } catch (error) {
          console.error(`Failed to sync queued item ${item.productId}:`, error);
        } finally {
          currentQueue = currentQueue.filter((q) => q.id !== item.id);
          saveCartLocally(currentQueue);
        }
      }

      await getCart();
      setSyncing(false);
    };

    flushQueue();
  }, [isAuthenticated, getCart]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (() => getCart())();
  }, [isAuthenticated, getCart]);

  const addItemToCart = async (product: Product, quantity: number) => {
    const productId = product.id;
    try {
      if (!isAuthenticated) {
        const cartItem = cart.find((c) => c.productId === productId);

        if (cartItem) {
          toast.error('Cannot add the same item to cart twice');
          return;
        }

        const id = (cart[cart.length - 1]?.id ?? 0) + 1;
        const newItem: CartItem = { productId, quantity, id, product };
        const newCart = [...cart, newItem];
        setCart(newCart);
        saveCartLocally(newCart);
        return;
      }

      const newItem = await cartApi.addItemToCart(productId, quantity);
      setCart((prev) => [...prev, newItem]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to add item to cart";
      toast.error(errMsg);
    }
  };

  const updateCartItem = async (id: number, quantity: number) => {
    if (!isAuthenticated) {
      const item = cart.find((c) => c.id === id);

      if (!item) {
        toast.error('This item does not exist in cart');
        return;
      }

      const updatedItem = { ...item, quantity };
      const updatedCart = cart.map((c) => (c.id === id ? updatedItem : c));

      setCart(updatedCart);
      saveCartLocally(updatedCart);
      return;
    }

    try {
      const updatedItem = await cartApi.updateCartItem(id, quantity);
      setCart((prev) => prev.map((p) => (p.id === id ? updatedItem : p)));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to update cart";
      toast.error(errMsg);
    }
  };

  const removeItemFromCart = async (id: number) => {
    if (!isAuthenticated) {
      const item = cart.find((c) => c.id === id);

      if (!item) {
        toast.error('This item does not exist in cart');
        return;
      }

      const updatedCart = cart.filter((c) => c.id !== id);
      setCart(updatedCart);
      saveCartLocally(updatedCart);
      return;
    }

    try {
      await cartApi.removeItemFromCart(id);
      setCart((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to remove item from cart";
      toast.error(errMsg);
    }
  };

  const refreshCart = async () => {
    if (!isAuthenticated) {
      return;
    }

    await getCart();
  }

  return (
    <CartContext.Provider
      value={{
        addItemToCart,
        updateCartItem,
        removeItemFromCart,
        loading,
        cart,
        count: cart.length,
        syncing,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('Cart context must be used within cart provider');
  return context;
};