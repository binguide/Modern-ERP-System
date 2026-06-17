import { api } from '../axios';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PurchaseReceiptLine {
  id?: string;
  purchaseReceiptId?: string;
  itemId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PurchaseReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  supplierId: string;
  supplierName?: string;
  status: string;
  total: number;
  notes?: string;
  lines?: PurchaseReceiptLine[];
  createdAt: string;
}

export interface CreatePurchaseReceiptDto {
  receiptDate: string;
  supplierId: string;
  notes?: string;
  lines: { description?: string; quantity: number; rate: number; amount: number }[];
}

export interface UpdatePurchaseReceiptDto {
  receiptDate?: string;
  supplierId?: string;
  notes?: string;
  lines?: { description?: string; quantity: number; rate: number; amount: number }[];
}

export const purchaseReceiptsApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<PurchaseReceipt>> => {
    const { data } = await api.get<{ data: PaginatedResponse<PurchaseReceipt> }>(
      '/purchase-receipts',
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<PurchaseReceipt> => {
    const { data } = await api.get<{ data: PurchaseReceipt }>(`/purchase-receipts/${id}`);
    return data.data;
  },

  create: async (dto: CreatePurchaseReceiptDto): Promise<PurchaseReceipt> => {
    const { data } = await api.post<{ data: PurchaseReceipt }>('/purchase-receipts', dto);
    return data.data;
  },

  update: async (id: string, dto: UpdatePurchaseReceiptDto): Promise<PurchaseReceipt> => {
    const { data } = await api.put<{ data: PurchaseReceipt }>(`/purchase-receipts/${id}`, dto);
    return data.data;
  },

  submit: async (id: string): Promise<PurchaseReceipt> => {
    const { data } = await api.post<{ data: PurchaseReceipt }>(`/purchase-receipts/${id}/submit`);
    return data.data;
  },

  cancel: async (id: string): Promise<PurchaseReceipt> => {
    const { data } = await api.post<{ data: PurchaseReceipt }>(`/purchase-receipts/${id}/cancel`);
    return data.data;
  },

  delete: (id: string) => api.delete(`/purchase-receipts/${id}`),
};
