"use client";

import AdminNavbar from "@/components/admin/AdminNavbar";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const { loading, user } = useAuth();
  const router = useRouter();

  const isStaff = user?.role === "ADMIN" || user?.role === "MANAGER";
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isStaff) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`)
    }
  }, [loading, isStaff, router, pathname]);

  if (loading || !isStaff) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
