"use client";

import { api } from "@/lib/axios";
import { useTokenStore } from "@/store/useTokenStore";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  setAuth: (data: { user: User, accessToken: string }) => void
  loading: boolean;
  fetchCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { clearToken, accessToken, setToken } = useTokenStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isAuthenticated = !!accessToken && !!user;

  const fetchCurrentUser = useCallback(async (): Promise<User | undefined> => {
    try {
      const res = await api.get('/auth/profile');
      const user: User = res.data;

      setUser(user)

      return user;
    } catch (e) {
      console.log(e);
      setUser(null)

    } finally {
      console.log("Setting loading to false")
      setLoading(false)
    }
  }, [])


  useEffect(() => {
    (() => fetchCurrentUser())();
  }, [fetchCurrentUser])


  const setAuth = (data: { user: User, accessToken: string }) => {
    const { accessToken, user } = data;
    setUser(user);
    setToken(accessToken);
    setLoading(false)
  }


  const logout = async () => {
    try {
      await api.post('/auth/logout');
      clearToken();
    } catch (e) {
      console.log(e)
    } finally {
      setUser(null)
    }
  }


  return <AuthContext value={
    {
      user,
      isAuthenticated,
      setAuth,
      logout,
      loading,
      fetchCurrentUser,
    }
  } >{children}</AuthContext>
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error('Auth context must be used inside auth provider');

  return context;
}