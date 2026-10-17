"use client";

import UserModal from "@/components/admin/users/UserModal";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminUsers,
  PaginationMeta,
  Role,
  toggleUserActive,
  updateUserRole,
} from "@/lib/admin-users";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export default function UsersClient() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async (pageNum = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const rolesParam = roleFilter === "ALL" ? undefined : [roleFilter];
      const res = await getAdminUsers(pageNum, 10, rolesParam);

      if (append) {
        setUsers((prev) => [...prev, ...res.data]);
      } else {
        setUsers(res.data);
      }

      setMeta(res.meta);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    const initUsers = () => {
      fetchUsers(1, false);
    }

    initUsers()
  }, [roleFilter, fetchUsers]);

  const handleLoadMore = () => {
    if (meta && meta.page < meta.lastPage) {
      fetchUsers(meta.page + 1, true);
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    if (currentUser?.id === targetUser.id) {
      toast.error("You cannot deactivate your own account");
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const updated = await toggleUserActive(targetUser.id, !targetUser.active);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`Account ${updated.active ? "activated" : "deactivated"}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (targetUser: User, newRole: Role) => {
    if (currentUser?.id === targetUser.id) {
      toast.error("You cannot modify your own role");
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const updated = await updateUserRole(targetUser.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`Role updated to ${newRole}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalUsersCount = meta?.total ?? users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const managerCount = users.filter((u) => u.role === "MANAGER").length;
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length;

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">User & Staff Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision staff, manage permissions, and inspect security status across accounts
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer shadow-md shadow-purple-900/30 shrink-0"
        >
          <UserPlus className="h-4 w-4" /> Provision Account
        </button>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Accounts</p>
          <p className="text-xl font-extrabold text-white mt-1">{totalUsersCount}</p>
        </div>
        <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-950/20">
          <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Admins Loaded</p>
          <p className="text-xl font-extrabold text-purple-200 mt-1">{adminCount}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Managers Loaded</p>
          <p className="text-xl font-extrabold text-white mt-1">{managerCount}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customers Loaded</p>
          <p className="text-xl font-extrabold text-white mt-1">{customerCount}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search loaded users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "ADMIN", "MANAGER", "CUSTOMER"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${roleFilter === r
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                }`}
            >
              {r === "ALL" ? "All Roles" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Security Notice</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading && !loadingMore ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                      <span>Loading user accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isBusy = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center font-bold text-purple-200 shrink-0 overflow-hidden">
                            {u.avatar ? (
                              <Image src={u.avatar} alt={u.firstName} fill className="object-cover" />
                            ) : (
                              <span>
                                {u.firstName?.[0]}
                                {u.lastName?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              {u.firstName} {u.lastName}
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-slate-400 text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="p-4">
                        {isSelf ? (
                          <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">
                            {u.role}
                          </span>
                        ) : (
                          <select
                            disabled={isBusy}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                            className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>

                      {/* Active Status Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${u.active
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                            }`}
                        >
                          {u.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {u.active ? "Active" : "Disabled"}
                        </span>
                      </td>

                      {/* Forced Password Reset Flag */}
                      <td className="p-4">
                        {u.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium">
                            <KeyRound className="h-3.5 w-3.5" /> Pending Reset
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Normal</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {!isSelf && (
                          <button
                            disabled={isBusy}
                            onClick={() => handleToggleActive(u)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${u.active
                              ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : u.active ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Pagination Bar */}
        {meta && meta.page < meta.lastPage && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Showing {users.length} of {meta.total} accounts
            </span>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-500/30 bg-purple-950/30 text-purple-300 hover:text-white hover:bg-purple-600 transition-all font-semibold cursor-pointer disabled:opacity-50"
            >
              {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loadingMore ? "Loading..." : "Load More Accounts"}
            </button>
          </div>
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchUsers(1, false)}
      />
    </div>
  );
}
