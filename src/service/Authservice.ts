import { api } from "./api";

export interface AuthUser {
  id: string;
  enrollment: string;
  role: "admin" | "user";
  diskId: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

export function loginRequest(enrollment: string, password: string) {
  return api.post<LoginResponse>("/auth/login", { enrollment, password });
}

export function getMeRequest() {
  return api.get<MeResponse>("/auth/me", { auth: true });
}