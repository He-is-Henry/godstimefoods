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

export const login = (data: LoginData) =>
  apiClient.post<{ user: User; accessToken: string }>("/auth/login", data);

export const signup = (data: SignupData) =>
  apiClient.post<{ user: User; accessToken: string }>("/auth/signup", data);

export const getSessions = () => apiClient.get<Session[]>("/auth/sessions");

export const revokeSession = (sessionId: string) =>
  apiClient.delete<Session[]>(`/auth/sessions/revoke/${sessionId}`);

export const revokeAllSessions = () =>
  apiClient.delete<Session[]>("auth/sessions/revoke/all");
