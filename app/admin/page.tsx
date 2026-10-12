import Link from "next/link";
import { Package, Users, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console - Godstime Foods",
  description: "Administrative console overview for Godstime Foods.",
};

export default function AdminDashboardPage() {
  const adminModules = [
    {
      title: "Catalog Management",
      description: "Manage products, categories, stock, and media asset library.",
      href: "/admin/products",
      icon: Package,
      badge: "Products & Media",
    },
    {
      title: "Users & Staff",
      description: "Manage user accounts, toggle active status, and assign staff roles.",
      href: "/admin/users",
      icon: Users,
      badge: "Account Security",
    },
    {
      title: "Orders & Fulfillment",
      description: "View customer orders, update delivery status, and handle dispatch.",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: "Orders",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <ShieldCheck className="h-4 w-4" /> Control Panel
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          Select a management module to manage inventory, accounts, and system data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminModules.map((module) => {
          const Icon = module.icon;

          return (
            <Link
              key={module.title}
              href={module.href}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900/90 transition-all shadow-lg hover:shadow-purple-950/20"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/50 border border-purple-500/20 text-purple-300">
                    {module.badge}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mb-1 group-hover:text-purple-300 transition-colors">
                  {module.title}
                </h3>
                <p className="text-xs text-slate-400">{module.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>Access Module</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
