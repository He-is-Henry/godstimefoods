import type { Metadata } from "next";
import { Suspense } from "react";
import UsersClient from "./users.client";

export const metadata: Metadata = {
  title: "User Management - Godstime Foods Admin",
  description: "Manage accounts, provision staff, and assign access roles.",
};

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      }
    >
      <UsersClient />
    </Suspense>
  );
}
