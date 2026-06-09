import { api } from '../axios';

export interface PeriodItem {
  id: string;
  fiscalYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  order: number;
  fiscalYear?: { code: string };
}

export interface QueryPeriodsParams {
  fiscalYearId?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const periodsApi = {
  findAll: async (params?: QueryPeriodsParams): Promise<PaginatedResponse<PeriodItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<PeriodItem> }>('/periods', { params });
    return data.data;
  },
};
