import { api } from '../axios';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface QuotationLine {
  id?: string;
  quotationId?: string;
  itemId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discountPct?: number;
  taxRate?: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil?: string;
  customerId: string;
  customerName?: string;
  status: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  lines?: QuotationLine[];
  createdAt: string;
}

export interface CreateQuotationDto {
  quotationDate: string;
  validUntil?: string;
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

export interface UpdateQuotationDto {
  quotationDate?: string;
  validUntil?: string;
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

export const quotationsApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Quotation>> => {
    const { data } = await api.get<{ data: PaginatedResponse<Quotation> }>('/quotations', {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<Quotation> => {
    const { data } = await api.get<{ data: Quotation }>(`/quotations/${id}`);
    return data.data;
  },

  create: async (dto: CreateQuotationDto): Promise<Quotation> => {
    const { data } = await api.post<{ data: Quotation }>('/quotations', dto);
    return data.data;
  },

  update: async (id: string, dto: UpdateQuotationDto): Promise<Quotation> => {
    const { data } = await api.put<{ data: Quotation }>(`/quotations/${id}`, dto);
    return data.data;
  },

  submit: async (id: string): Promise<Quotation> => {
    const { data } = await api.post<{ data: Quotation }>(`/quotations/${id}/submit`);
    return data.data;
  },

  cancel: async (id: string): Promise<Quotation> => {
    const { data } = await api.post<{ data: Quotation }>(`/quotations/${id}/cancel`);
    return data.data;
  },

  delete: (id: string) => api.delete(`/quotations/${id}`),
};
