import { api } from '../axios';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  branchId?: string | null;
  branch?: { id: string; name: string; code: string } | null;
  roles: Array<{ id: string; code: string; name: string }>;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  branchId?: string;
  roleIds?: string[];
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  branchId?: string;
  roleIds?: string[];
}

export interface QueryUsersParams {
  search?: string;
  isActive?: boolean;
  roleId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const usersApi = {
  create: async (payload: CreateUserPayload) => {
    const { data } = await api.post<{ data: UserListItem }>('/users', payload);
    return data.data;
  },
  findAll: async (params?: QueryUsersParams) => {
    const { data } = await api.get<{ data: PaginatedResponse<UserListItem> }>('/users', { params });
    return data.data;
  },
  findById: async (id: string) => {
    const { data } = await api.get<{ data: UserListItem }>(`/users/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await api.put<{ data: UserListItem }>(`/users/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};
