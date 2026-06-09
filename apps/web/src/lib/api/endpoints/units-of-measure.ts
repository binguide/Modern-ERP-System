import { api } from '../axios';

export interface UnitOfMeasureItem {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CreateUnitOfMeasurePayload {
  code: string;
  name: string;
  isActive?: boolean;
}

export interface UpdateUnitOfMeasurePayload {
  code?: string;
  name?: string;
  isActive?: boolean;
}

export interface QueryUnitsOfMeasureParams {
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

export const unitsOfMeasureApi = {
  create: async (payload: CreateUnitOfMeasurePayload): Promise<UnitOfMeasureItem> => {
    const { data } = await api.post<{ data: UnitOfMeasureItem }>('/units-of-measure', payload);
    return data.data;
  },
  findAll: async (
    params?: QueryUnitsOfMeasureParams,
  ): Promise<PaginatedResponse<UnitOfMeasureItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<UnitOfMeasureItem> }>(
      '/units-of-measure',
      { params },
    );
    return data.data;
  },
  findById: async (id: string): Promise<UnitOfMeasureItem> => {
    const { data } = await api.get<{ data: UnitOfMeasureItem }>(`/units-of-measure/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateUnitOfMeasurePayload): Promise<UnitOfMeasureItem> => {
    const { data } = await api.put<{ data: UnitOfMeasureItem }>(`/units-of-measure/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/units-of-measure/${id}`);
  },
};
