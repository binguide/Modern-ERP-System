import { api } from '../axios';

export type SalesOrderStatus = 'draft' | 'saved' | 'confirmed' | 'cancelled';

export interface SalesOrderLineItem {
  id?: string;
  itemId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  price: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface SalesOrderItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customer?: { id: string; code: string; name: string };
  status: SalesOrderStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  poNo?: string;
  deliveryDate?: string;
  orderType?: string;
  shippingAddress?: string;
  currency: string;
  exchangeRate: number;
  priceList?: string;
  paymentTerms?: string;
  taxTemplate?: string;
  debitTo?: string;
  incomeAccount?: string;
  costCenter?: string;
  project?: string;
  territory?: string;
  salesPerson?: string;
  source?: string;
  campaign?: string;
  lines?: SalesOrderLineItem[];
}

export interface CreateSalesOrderLinePayload {
  itemId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  price: number;
  discount?: number;
  taxRate?: number;
}

export interface UpdateSalesOrderLinePayload {
  id?: string;
  itemId?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  price?: number;
  discount?: number;
  taxRate?: number;
}

export interface CreateSalesOrderPayload {
  orderDate: string;
  customerId: string;
  poNo?: string;
  deliveryDate?: string;
  orderType?: string;
  shippingAddress?: string;
  currency?: string;
  exchangeRate?: number;
  priceList?: string;
  paymentTerms?: string;
  taxTemplate?: string;
  debitTo?: string;
  incomeAccount?: string;
  costCenter?: string;
  project?: string;
  territory?: string;
  salesPerson?: string;
  source?: string;
  campaign?: string;
  notes?: string;
  lines?: CreateSalesOrderLinePayload[];
}

export interface UpdateSalesOrderPayload {
  orderDate?: string;
  customerId?: string;
  status?: SalesOrderStatus;
  poNo?: string;
  deliveryDate?: string;
  orderType?: string;
  shippingAddress?: string;
  currency?: string;
  exchangeRate?: number;
  priceList?: string;
  paymentTerms?: string;
  taxTemplate?: string;
  debitTo?: string;
  incomeAccount?: string;
  costCenter?: string;
  project?: string;
  territory?: string;
  salesPerson?: string;
  source?: string;
  campaign?: string;
  notes?: string;
  lines?: UpdateSalesOrderLinePayload[];
}

export interface QuerySalesOrdersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  customerId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const salesOrdersApi = {
  create: async (payload: CreateSalesOrderPayload): Promise<SalesOrderItem> => {
    const { data } = await api.post<{ data: SalesOrderItem }>('/sales-orders', payload);
    return data.data;
  },
  findAll: async (params?: QuerySalesOrdersParams): Promise<PaginatedResponse<SalesOrderItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<SalesOrderItem> }>('/sales-orders', {
      params,
    });
    return data.data;
  },
  findById: async (id: string): Promise<SalesOrderItem> => {
    const { data } = await api.get<{ data: SalesOrderItem }>(`/sales-orders/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateSalesOrderPayload): Promise<SalesOrderItem> => {
    const { data } = await api.put<{ data: SalesOrderItem }>(`/sales-orders/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/sales-orders/${id}`);
  },
  submit: async (id: string): Promise<SalesOrderItem> => {
    const { data } = await api.post<{ data: SalesOrderItem }>(`/sales-orders/${id}/submit`);
    return data.data;
  },
  cancel: async (id: string): Promise<SalesOrderItem> => {
    const { data } = await api.post<{ data: SalesOrderItem }>(`/sales-orders/${id}/cancel`);
    return data.data;
  },
  amend: async (id: string): Promise<SalesOrderItem> => {
    const { data } = await api.post<{ data: SalesOrderItem }>(`/sales-orders/${id}/amend`);
    return data.data;
  },
};
