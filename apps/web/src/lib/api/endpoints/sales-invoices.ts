import { api } from '../axios';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SalesInvoiceLine {
  id?: string;
  salesInvoiceId?: string;
  itemId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discountPct?: number;
  taxRate?: number;
  amount: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  customerId: string;
  customerName?: string;
  status: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  lines?: SalesInvoiceLine[];
  createdAt: string;
}

export interface CreateSalesInvoiceDto {
  invoiceDate: string;
  dueDate?: string;
  customerId: string;
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

export interface UpdateSalesInvoiceDto {
  invoiceDate?: string;
  dueDate?: string;
  customerId?: string;
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

export const salesInvoicesApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<SalesInvoice>> => {
    const { data } = await api.get<{ data: PaginatedResponse<SalesInvoice> }>('/sales-invoices', {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<SalesInvoice> => {
    const { data } = await api.get<{ data: SalesInvoice }>(`/sales-invoices/${id}`);
    return data.data;
  },

  create: async (dto: CreateSalesInvoiceDto): Promise<SalesInvoice> => {
    const { data } = await api.post<{ data: SalesInvoice }>('/sales-invoices', dto);
    return data.data;
  },

  update: async (id: string, dto: UpdateSalesInvoiceDto): Promise<SalesInvoice> => {
    const { data } = await api.put<{ data: SalesInvoice }>(`/sales-invoices/${id}`, dto);
    return data.data;
  },

  submit: async (id: string): Promise<SalesInvoice> => {
    const { data } = await api.post<{ data: SalesInvoice }>(`/sales-invoices/${id}/submit`);
    return data.data;
  },

  cancel: async (id: string): Promise<SalesInvoice> => {
    const { data } = await api.post<{ data: SalesInvoice }>(`/sales-invoices/${id}/cancel`);
    return data.data;
  },

  delete: (id: string) => api.delete(`/sales-invoices/${id}`),
};
