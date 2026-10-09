import { create } from "zustand";

interface TokenState {
  accessToken: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  accessToken: null,
  setToken: (token) => set({ accessToken: token }),
  clearToken: () => set({ accessToken: null }),
}));
