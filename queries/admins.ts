import { useQuery } from "@/hooks/useQuery";
import { getAdminUsers, PaginatedUsersRes, Role } from "@/lib/admin-users";

export const useAdminUsersQuery = {
  adminUsers(page = 1, limit = 20, roles?: Role[]) {
    const rolesKey =
      roles && roles.length > 0 ? [...roles].sort().join(",") : "all";
    const key = `/admin/users?page=${page}&limit=${limit}&roles=${rolesKey}`;

    return useQuery<PaginatedUsersRes>({
      key,
      fetcher: () => getAdminUsers(page, limit, roles),
    });
  },
};
