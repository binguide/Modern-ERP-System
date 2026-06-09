import { api } from '../axios';

export interface TaxItem {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  isActive: boolean;
  isDefault: boolean;
}

export interface CreateTaxPayload {
  code: string;
  name: string;
  rate: number;
  type?: 'percentage' | 'fixed';
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateTaxPayload {
  code?: string;
  name?: string;
  rate?: number;
  type?: 'percentage' | 'fixed';
  isActive?: boolean;
  isDefault?: boolean;
}

export interface QueryTaxesParams {
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

export const taxesApi = {
  create: async (payload: CreateTaxPayload): Promise<TaxItem> => {
    const { data } = await api.post<{ data: TaxItem }>('/taxes', payload);
    return data.data;
  },
  findAll: async (params?: QueryTaxesParams): Promise<PaginatedResponse<TaxItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<TaxItem> }>('/taxes', { params });
    return data.data;
  },
  findById: async (id: string): Promise<TaxItem> => {
    const { data } = await api.get<{ data: TaxItem }>(`/taxes/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateTaxPayload): Promise<TaxItem> => {
    const { data } = await api.put<{ data: TaxItem }>(`/taxes/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/taxes/${id}`);
  },
};
