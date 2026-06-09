import { api } from '../axios';

export interface ItemUnitItem {
  id: string;
  unitId: string;
  unit?: { id: string; code: string; name: string };
  conversionRate: number;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  isDefault: boolean;
}

export interface ItemItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  costPrice: number;
  sellingPrice: number;
  itemGroupId?: string;
  itemGroup?: { id: string; code: string; name: string };
  imageUrl?: string;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
  defaultWarehouseId?: string;
  defaultWarehouse?: { id: string; code: string; name: string };
  units?: ItemUnitItem[];
}

export interface CreateItemUnitPayload {
  unitId: string;
  conversionRate?: number;
  barcode?: string;
  costPrice?: number;
  sellingPrice?: number;
  isDefault?: boolean;
}

export interface CreateItemPayload {
  sku: string;
  name: string;
  description?: string;
  type?: 'product' | 'service';
  costPrice?: number;
  sellingPrice?: number;
  itemGroupId?: string;
  imageUrl?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
  isActive?: boolean;
  defaultWarehouseId?: string;
  units?: CreateItemUnitPayload[];
}

export interface UpdateItemUnitPayload {
  id?: string;
  unitId?: string;
  conversionRate?: number;
  barcode?: string;
  costPrice?: number;
  sellingPrice?: number;
  isDefault?: boolean;
}

export interface UpdateItemPayload {
  sku?: string;
  name?: string;
  description?: string;
  type?: 'product' | 'service';
  costPrice?: number;
  sellingPrice?: number;
  itemGroupId?: string;
  imageUrl?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
  isActive?: boolean;
  defaultWarehouseId?: string;
  units?: UpdateItemUnitPayload[];
}

export interface QueryItemsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  isActive?: boolean;
  itemGroupId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const itemsApi = {
  create: async (payload: CreateItemPayload): Promise<ItemItem> => {
    const { data } = await api.post<{ data: ItemItem }>('/items', payload);
    return data.data;
  },
  findAll: async (params?: QueryItemsParams): Promise<PaginatedResponse<ItemItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<ItemItem> }>('/items', { params });
    return data.data;
  },
  findById: async (id: string): Promise<ItemItem> => {
    const { data } = await api.get<{ data: ItemItem }>(`/items/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateItemPayload): Promise<ItemItem> => {
    const { data } = await api.put<{ data: ItemItem }>(`/items/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};
