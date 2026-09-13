import { api } from "./api";

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    enrollment: string;
    diskId: string;
  };
}

// 👑 ફક્ત Super-Admin આ ફંક્શન કોલ કરી શકશે
export function createUserByAdminRequest(enrollment: string, password: string) {
  return api.post<CreateUserResponse>(
    "/admin/create-user",
    { enrollment, password },
    { auth: true }
  );
}