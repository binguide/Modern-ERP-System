import { api } from '../axios';

export interface PermissionInfo {
  resource: string;
  action: string;
  scope: string;
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  companyId: string;
  permissions: PermissionInfo[];
  createdAt: string;
}

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  permissions?: PermissionInfo[];
}

export interface UpdateRolePayload {
  code?: string;
  name?: string;
  description?: string;
  permissions?: PermissionInfo[];
}

export interface QueryRolesParams {
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

export const rolesApi = {
  create: async (payload: CreateRolePayload) => {
    const { data } = await api.post<{ data: RoleItem }>('/roles', payload);
    return data.data;
  },
  findAll: async (params?: QueryRolesParams) => {
    const { data } = await api.get<{ data: PaginatedResponse<RoleItem> }>('/roles', { params });
    return data.data;
  },
  findById: async (id: string) => {
    const { data } = await api.get<{ data: RoleItem }>(`/roles/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateRolePayload) => {
    const { data } = await api.put<{ data: RoleItem }>(`/roles/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/roles/${id}`);
  },
};
