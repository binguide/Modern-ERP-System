import { api } from '../axios';

export interface ItemGroupItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateItemGroupPayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateItemGroupPayload {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface QueryItemGroupsParams {
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

export const itemGroupsApi = {
  create: async (payload: CreateItemGroupPayload): Promise<ItemGroupItem> => {
    const { data } = await api.post<{ data: ItemGroupItem }>('/item-groups', payload);
    return data.data;
  },
  findAll: async (params?: QueryItemGroupsParams): Promise<PaginatedResponse<ItemGroupItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<ItemGroupItem> }>('/item-groups', {
      params,
    });
    return data.data;
  },
  findById: async (id: string): Promise<ItemGroupItem> => {
    const { data } = await api.get<{ data: ItemGroupItem }>(`/item-groups/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateItemGroupPayload): Promise<ItemGroupItem> => {
    const { data } = await api.put<{ data: ItemGroupItem }>(`/item-groups/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/item-groups/${id}`);
  },
};
