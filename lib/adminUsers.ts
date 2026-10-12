import { apiClient } from "./apiClient";

export type Role = "ADMIN" | "MANAGER" | "CUSTOMER";

export type CreateUserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

export type PaginationMeta = {
  total: number;
  page: number;
  lastPage: number;
};

export type PaginatedUsersRes = {
  data: User[];
  meta: PaginationMeta;
};

export const getAdminUsers = (page = 1, limit = 20, roles?: Role[]) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (roles && roles.length > 0) {
    query.set("roles", roles.join(","));
  }
  return apiClient.get<PaginatedUsersRes>(`/admin/users?${query.toString()}`);
};

export const createAdminUser = (data: CreateUserData) =>
  apiClient.post<User>("/admin/users", data);

export const toggleUserActive = (userId: number, isActive: boolean) =>
  apiClient.patch<User>(`/admin/users/${userId}/active`, { isActive });

export const updateUserRole = (userId: number, role: Role) =>
  apiClient.patch<User>(`/admin/users/${userId}/role`, { role });
