import { apiClient } from "./api-client";

export type Role = "ADMIN" | "MANAGER" | "CUSTOMER";

export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
  createdAt?: string;
};

export type CreateUserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

type GetUsersResponse = {
  data?: AdminUser[];
  users?: AdminUser[];
  total?: number;
} | AdminUser[];

export async function getAdminUsers(page = 1, limit = 50, roles?: Role[]): Promise<AdminUser[]> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (roles && roles.length > 0) {
    query.set("roles", roles.join(","));
  }
  const res = await apiClient.get<GetUsersResponse>(`/admin/users?${query.toString()}`);
  if (Array.isArray(res)) return res;
  if ("users" in res && Array.isArray(res.users)) return res.users;
  if ("data" in res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function createAdminUser(data: CreateUserData): Promise<AdminUser> {
  return apiClient.post<AdminUser>("/admin/users", data);
}

export async function toggleUserActive(userId: number, isActive: boolean): Promise<AdminUser> {
  return apiClient.patch<AdminUser>(`/admin/users/${userId}/active`, { isActive });
}

export async function updateUserRole(userId: number, role: Role): Promise<AdminUser> {
  return apiClient.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
}
