import { apiClient } from "./apiClient";

type LoginData = {
  email: string;
  password: string;
};

type SignupData = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  password: string;
};

type LoginRes = { user: User; accessToken: string };

export const login = (data: LoginData) =>
  apiClient.post<LoginRes>("/auth/login", data);

export const signup = (data: SignupData) =>
  apiClient.post<LoginRes>("/auth/signup", data);

export const getSessions = () => apiClient.get<Session[]>("/auth/sessions");

export const revokeSession = (sessionId: string) =>
  apiClient.delete<Session[]>(`/auth/sessions/revoke/${sessionId}`);

export const revokeAllSessions = () =>
  apiClient.delete<Session[]>("auth/sessions/revoke/all");

export const updateProfile = (data: UpdateUserData) =>
  apiClient.patch<User>("/auth/profile", data);

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.patch<User>("/auth/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const changePassword = (data: ChangePasswordPayload) =>
  apiClient.patch<LoginRes>("/auth/change-password", data);
