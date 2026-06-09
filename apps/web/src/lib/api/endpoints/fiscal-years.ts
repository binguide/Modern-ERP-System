import { api } from '../axios';

export interface FiscalYearItem {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  isDefault: boolean;
}

export interface CreateFiscalYearPayload {
  code: string;
  startDate: string;
  endDate: string;
  isDefault?: boolean;
  isClosed?: boolean;
}

export interface UpdateFiscalYearPayload {
  code?: string;
  startDate?: string;
  endDate?: string;
  isDefault?: boolean;
  isClosed?: boolean;
}

export interface QueryFiscalYearsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  isActive?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const fiscalYearsApi = {
  create: async (payload: CreateFiscalYearPayload): Promise<FiscalYearItem> => {
    const { data } = await api.post<{ data: FiscalYearItem }>('/fiscal-years', payload);
    return data.data;
  },
  findAll: async (params?: QueryFiscalYearsParams): Promise<PaginatedResponse<FiscalYearItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<FiscalYearItem> }>('/fiscal-years', {
      params,
    });
    return data.data;
  },
  findById: async (id: string): Promise<FiscalYearItem> => {
    const { data } = await api.get<{ data: FiscalYearItem }>(`/fiscal-years/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateFiscalYearPayload): Promise<FiscalYearItem> => {
    const { data } = await api.put<{ data: FiscalYearItem }>(`/fiscal-years/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/fiscal-years/${id}`);
  },
};
