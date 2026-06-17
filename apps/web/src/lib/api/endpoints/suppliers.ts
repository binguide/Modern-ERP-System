import { api } from '../axios';

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive: boolean;
}

export interface CreateSupplierPayload {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

export interface UpdateSupplierPayload {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

export interface QuerySuppliersParams {
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

export const suppliersApi = {
  create: async (payload: CreateSupplierPayload): Promise<SupplierItem> => {
    const { data } = await api.post<{ data: SupplierItem }>('/suppliers', payload);
    return data.data;
  },
  findAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<SupplierItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<SupplierItem> }>('/suppliers', {
      params,
    });
    return data.data;
  },
  findById: async (id: string): Promise<SupplierItem> => {
    const { data } = await api.get<{ data: SupplierItem }>(`/suppliers/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateSupplierPayload): Promise<SupplierItem> => {
    const { data } = await api.put<{ data: SupplierItem }>(`/suppliers/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
