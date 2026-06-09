import { api } from '../axios';

export interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export interface CreateWarehousePayload {
  code: string;
  name: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateWarehousePayload {
  code?: string;
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface QueryWarehousesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  isActive?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const warehousesApi = {
  create: async (payload: CreateWarehousePayload): Promise<WarehouseItem> => {
    const { data } = await api.post<{ data: WarehouseItem }>('/warehouses', payload);
    return data.data;
  },
  findAll: async (params?: QueryWarehousesParams): Promise<PaginatedResponse<WarehouseItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<WarehouseItem> }>('/warehouses', {
      params,
    });
    return data.data;
  },
  findById: async (id: string): Promise<WarehouseItem> => {
    const { data } = await api.get<{ data: WarehouseItem }>(`/warehouses/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateWarehousePayload): Promise<WarehouseItem> => {
    const { data } = await api.put<{ data: WarehouseItem }>(`/warehouses/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },
};
