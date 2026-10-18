"use client";

import { useAuth } from "@/context/AuthContext";
import { getUnreadCount } from "@/lib/messages";
import React, { createContext, useContext, useEffect, useState } from "react";

interface MessagesContextType {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  decrementUnread: (by?: number) => void;
  clearUnread: () => void;
  refreshUnreadCount: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getUnreadCount();
      if (res && typeof res.count === "number") {
        setUnreadCount(res.count);
      }
    } catch {
      // Silently swallow unauthenticated or network errors
    }
  };

  useEffect(() => {
    const refresh = () => refreshUnreadCount();

    refresh();

    const onFocus = () => refreshUnreadCount();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated]);

  const decrementUnread = (by = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by));
  };

  const clearUnread = () => {
    setUnreadCount(0);
  };

  return (
    <MessagesContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
        decrementUnread,
        clearUnread,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useUnreadMessages must be used within a MessagesProvider");
  }
  return context;
}
