"use client";

import { useCart } from "@/context/CartContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Home, MessageSquare, Package, ShoppingBag, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { unreadCount } = useUnreadMessages();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Cart", href: "/cart", icon: ShoppingBag, badge: count },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Messages", href: "/inbox", icon: MessageSquare, badge: unreadCount },
    { label: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isActive ? "text-purple-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-md shadow-pink-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
