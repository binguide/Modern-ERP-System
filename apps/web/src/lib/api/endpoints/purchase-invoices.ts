import { api } from '../axios';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PurchaseInvoiceLine {
  id?: string;
  purchaseInvoiceId?: string;
  itemId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discountPct?: number;
  taxRate?: number;
  amount: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  supplierId: string;
  supplierName?: string;
  status: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  lines?: PurchaseInvoiceLine[];
  createdAt: string;
}

export interface CreatePurchaseInvoiceDto {
  invoiceDate: string;
  dueDate?: string;
  supplierId: string;
  notes?: string;
  lines: {
    itemId?: string;
    description?: string;
    quantity: number;
    rate: number;
    discountPct: number;
    taxRate: number;
    amount: number;
  }[];
}

export interface UpdatePurchaseInvoiceDto {
  invoiceDate?: string;
  dueDate?: string;
  supplierId?: string;
  notes?: string;
  lines?: {
    itemId?: string;
    description?: string;
    quantity: number;
    rate: number;
    discountPct: number;
    taxRate: number;
    amount: number;
  }[];
}

export const purchaseInvoicesApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<PurchaseInvoice>> => {
    const { data } = await api.get<{ data: PaginatedResponse<PurchaseInvoice> }>(
      '/purchase-invoices',
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<PurchaseInvoice> => {
    const { data } = await api.get<{ data: PurchaseInvoice }>(`/purchase-invoices/${id}`);
    return data.data;
  },

  create: async (dto: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice> => {
    const { data } = await api.post<{ data: PurchaseInvoice }>('/purchase-invoices', dto);
    return data.data;
  },

  update: async (id: string, dto: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoice> => {
    const { data } = await api.put<{ data: PurchaseInvoice }>(`/purchase-invoices/${id}`, dto);
    return data.data;
  },

  submit: async (id: string): Promise<PurchaseInvoice> => {
    const { data } = await api.post<{ data: PurchaseInvoice }>(`/purchase-invoices/${id}/submit`);
    return data.data;
  },

  cancel: async (id: string): Promise<PurchaseInvoice> => {
    const { data } = await api.post<{ data: PurchaseInvoice }>(`/purchase-invoices/${id}/cancel`);
    return data.data;
  },

  delete: (id: string) => api.delete(`/purchase-invoices/${id}`),
};
