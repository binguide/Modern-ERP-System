import { api } from '../axios';

export interface CustomerItem {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
}

export interface CreateCustomerPayload {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface UpdateCustomerPayload {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface QueryCustomersParams {
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

export const customersApi = {
  create: async (payload: CreateCustomerPayload): Promise<CustomerItem> => {
    const { data } = await api.post<{ data: CustomerItem }>('/customers', payload);
    return data.data;
  },
  findAll: async (params?: QueryCustomersParams): Promise<PaginatedResponse<CustomerItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<CustomerItem> }>('/customers', {
      params,
    });
    return data.data;
  },
  findById: async (id: string): Promise<CustomerItem> => {
    const { data } = await api.get<{ data: CustomerItem }>(`/customers/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateCustomerPayload): Promise<CustomerItem> => {
    const { data } = await api.put<{ data: CustomerItem }>(`/customers/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
