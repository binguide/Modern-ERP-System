import { api } from '../axios';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  depreciationMethod?: string;
  usefulLifeYears?: number;
  salvageValuePct?: number;
  isActive: boolean;
}

export interface FixedAsset {
  id: string;
  assetCode: string;
  name: string;
  categoryId: string;
  category?: AssetCategory;
  purchaseDate: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: string;
  accumulatedDepreciation: number;
  bookValue: number;
  status: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export const assetCategoriesApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<AssetCategory>> => {
    const { data } = await api.get<{ data: PaginatedResponse<AssetCategory> }>(
      '/asset-categories',
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<AssetCategory> => {
    const { data } = await api.get<{ data: AssetCategory }>(`/asset-categories/${id}`);
    return data.data;
  },

  create: async (dto: Partial<AssetCategory>): Promise<AssetCategory> => {
    const { data } = await api.post<{ data: AssetCategory }>('/asset-categories', dto);
    return data.data;
  },

  update: async (id: string, dto: Partial<AssetCategory>): Promise<AssetCategory> => {
    const { data } = await api.put<{ data: AssetCategory }>(`/asset-categories/${id}`, dto);
    return data.data;
  },

  delete: (id: string) => api.delete(`/asset-categories/${id}`),
};

export const fixedAssetsApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<FixedAsset>> => {
    const { data } = await api.get<{ data: PaginatedResponse<FixedAsset> }>('/fixed-assets', {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<FixedAsset> => {
    const { data } = await api.get<{ data: FixedAsset }>(`/fixed-assets/${id}`);
    return data.data;
  },

  create: async (dto: Partial<FixedAsset>): Promise<FixedAsset> => {
    const { data } = await api.post<{ data: FixedAsset }>('/fixed-assets', dto);
    return data.data;
  },

  update: async (id: string, dto: Partial<FixedAsset>): Promise<FixedAsset> => {
    const { data } = await api.put<{ data: FixedAsset }>(`/fixed-assets/${id}`, dto);
    return data.data;
  },

  dispose: async (id: string): Promise<FixedAsset> => {
    const { data } = await api.post<{ data: FixedAsset }>(`/fixed-assets/${id}/dispose`);
    return data.data;
  },

  delete: (id: string) => api.delete(`/fixed-assets/${id}`),
};
