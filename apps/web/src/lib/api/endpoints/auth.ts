import { api } from '../axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Permission {
  resource: string;
  action: string;
  scope: string;
}

export interface RoleInfo {
  id: string;
  code: string;
  name: string;
  permissions: Permission[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  phone?: string | null;
  avatarUrl?: string | null;
  branchId?: string | null;
  branch?: {
    id: string;
    name: string;
    code: string;
  } | null;
  roles: RoleInfo[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<{ data: LoginResponse }>('/auth/login', payload);
    return data.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>('/auth/me');
    return data.data;
  },
  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh', {
      refreshToken: '',
    });
    return data.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};
