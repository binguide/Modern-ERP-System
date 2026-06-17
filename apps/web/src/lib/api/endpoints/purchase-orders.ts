import { api } from '../axios';

export interface PurchaseOrderLineItem {
  id?: string;
  itemId?: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discountPct?: number;
  taxRate?: number;
  amount?: number;
}

export interface PurchaseOrderItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  supplierId: string;
  supplier?: { id: string; code: string; name: string };
  status: string;
  expectedDate?: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  lines?: PurchaseOrderLineItem[];
}

export interface CreatePurchaseOrderPayload {
  orderDate: string;
  supplierId: string;
  expectedDate?: string;
  notes?: string;
  lines?: CreatePurchaseOrderLinePayload[];
}

export interface CreatePurchaseOrderLinePayload {
  itemId?: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discountPct?: number;
  taxRate?: number;
}

export interface UpdatePurchaseOrderPayload {
  orderDate?: string;
  supplierId?: string;
  expectedDate?: string;
  notes?: string;
  lines?: UpdatePurchaseOrderLinePayload[];
}

export interface UpdatePurchaseOrderLinePayload {
  id?: string;
  itemId?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  discountPct?: number;
  taxRate?: number;
}

export interface QueryPurchaseOrdersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  supplierId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const purchaseOrdersApi = {
  create: async (payload: CreatePurchaseOrderPayload): Promise<PurchaseOrderItem> => {
    const { data } = await api.post<{ data: PurchaseOrderItem }>('/purchase-orders', payload);
    return data.data;
  },
  findAll: async (
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<PurchaseOrderItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<PurchaseOrderItem> }>(
      '/purchase-orders',
      { params },
    );
    return data.data;
  },
  findById: async (id: string): Promise<PurchaseOrderItem> => {
    const { data } = await api.get<{ data: PurchaseOrderItem }>(`/purchase-orders/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdatePurchaseOrderPayload): Promise<PurchaseOrderItem> => {
    const { data } = await api.put<{ data: PurchaseOrderItem }>(`/purchase-orders/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },
  submit: async (id: string): Promise<PurchaseOrderItem> => {
    const { data } = await api.post<{ data: PurchaseOrderItem }>(`/purchase-orders/${id}/submit`);
    return data.data;
  },
  cancel: async (id: string): Promise<PurchaseOrderItem> => {
    const { data } = await api.post<{ data: PurchaseOrderItem }>(`/purchase-orders/${id}/cancel`);
    return data.data;
  },
};
