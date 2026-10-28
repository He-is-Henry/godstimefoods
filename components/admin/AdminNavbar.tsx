"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Users, Shield, Store, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Catalog", href: "/admin/products", icon: Package, exact: false },
    { label: "Users & Staff", href: "/admin/users", icon: Users, exact: false },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-wide group-hover:text-purple-300 transition-colors">
                Godstime Food Canteen
              </span>
              <span className="text-[10px] block text-purple-400 font-semibold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="h-4 w-px bg-slate-800" />

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Main Store</span>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                  >
                    <Icon className="h-4 w-4 text-purple-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-800/80">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-purple-400" />
                  <span>Back to Main Store</span>
                </div>
                <span className="text-[10px] text-slate-500">Exit Admin</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
