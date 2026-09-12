import { api } from "./api";

export interface LoginResponse {
  token: string;
  user: { id: string; enrollment: string };
}

export interface MeResponse {
  user: { id: string; enrollment: string };
}

export function loginRequest(enrollment: string, password: string) {
  return api.post<LoginResponse>("/auth/login", { enrollment, password });
}

export function getMeRequest() {
  return api.get<MeResponse>("/auth/me", { auth: true });
}