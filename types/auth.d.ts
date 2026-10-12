interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar: string | null;
  active: boolean;
  mustChangePassword: boolean;
  role: "ADMIN" | "CUSTOMER" | "MANAGER";
  createdAt: string;
}
