"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUnreadMessages } from "@/context/MessagesContext"
import { Shield, ShoppingBag, ShoppingCart, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { count } = useCart();
  const { unreadCount } = useUnreadMessages();

  const isStaff = user?.role === "ADMIN" || user?.role === "MANAGER";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Orders", href: "/orders" },
    { label: "Messages", href: "/inbox", badge: unreadCount },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-linear-to-tr from-purple-600 to-pink-600 text-white transition-transform group-hover:scale-105">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                Godstime Food Canteen
              </span>
            </Link>

            {/* Navigation links for Desktop */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors hover:text-purple-300 flex items-center gap-1.5 ${isActive
                        ? "text-purple-400 font-bold"
                        : "text-slate-300"
                      }`}
                  >
                    <span>{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-pink-600 text-white shadow-sm shadow-pink-950">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl border border-purple-500/20 bg-purple-950/30 text-purple-200 hover:text-white hover:border-pink-500/40 transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white shadow-md shadow-pink-900/50">
                  {count}
                </span>
              )}
            </Link>

            {authLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-800" />
            ) : user ? (
              <div className="flex items-center gap-2.5">
                {isStaff && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs font-semibold text-purple-200 hover:text-white hover:border-pink-500/40 transition-all shadow-md shadow-purple-950/50"
                  >
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="hidden sm:inline">Admin Console</span>
                  </Link>
                )}

                {/* Profile Link (Desktop) */}
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-sm font-medium text-purple-200 hover:text-white hover:border-pink-500/40 transition-all"
                >
                  <UserIcon className="h-4 w-4 text-pink-400" />
                  <span>{user.firstName}</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md shadow-pink-500/20 transition-all"
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
