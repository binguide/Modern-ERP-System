import { api } from '../axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    companyId: string;
    roles: string[];
    permissions: string[];
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  companyId: string;
  roles: string[];
  permissions: string[];
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
    const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
    return data.data;
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  },
};
