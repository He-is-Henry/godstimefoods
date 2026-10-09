"use client";

import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, ShoppingCart, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, loading: authLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white transition-transform group-hover:scale-105">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              Godstime Foods
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl border border-purple-500/20 bg-purple-950/30 text-purple-200 hover:text-white hover:border-pink-500/40 transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white shadow-md shadow-pink-900/50">
                0
              </span>
            </Link>

            {authLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-800" />
            ) : user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-sm font-medium text-purple-200 hover:text-white hover:border-pink-500/40 transition-all"
              >
                <UserIcon className="h-4 w-4 text-pink-400" />
                <span>{user.firstName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md shadow-pink-500/20 transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
