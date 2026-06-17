import { api } from '../axios';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DeliveryNoteLine {
  id?: string;
  deliveryNoteId?: string;
  itemId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  deliveryDate: string;
  customerId: string;
  customerName?: string;
  status: string;
  total: number;
  notes?: string;
  lines?: DeliveryNoteLine[];
  createdAt: string;
}

export interface CreateDeliveryNoteDto {
  deliveryDate: string;
  customerId: string;
  notes?: string;
  lines: { description?: string; quantity: number; rate: number; amount: number }[];
}

export interface UpdateDeliveryNoteDto {
  deliveryDate?: string;
  customerId?: string;
  notes?: string;
  lines?: { description?: string; quantity: number; rate: number; amount: number }[];
}

export const deliveryNotesApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<DeliveryNote>> => {
    const { data } = await api.get<{ data: PaginatedResponse<DeliveryNote> }>('/delivery-notes', {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<DeliveryNote> => {
    const { data } = await api.get<{ data: DeliveryNote }>(`/delivery-notes/${id}`);
    return data.data;
  },

  create: async (dto: CreateDeliveryNoteDto): Promise<DeliveryNote> => {
    const { data } = await api.post<{ data: DeliveryNote }>('/delivery-notes', dto);
    return data.data;
  },

  update: async (id: string, dto: UpdateDeliveryNoteDto): Promise<DeliveryNote> => {
    const { data } = await api.put<{ data: DeliveryNote }>(`/delivery-notes/${id}`, dto);
    return data.data;
  },

  submit: async (id: string): Promise<DeliveryNote> => {
    const { data } = await api.post<{ data: DeliveryNote }>(`/delivery-notes/${id}/submit`);
    return data.data;
  },

  cancel: async (id: string): Promise<DeliveryNote> => {
    const { data } = await api.post<{ data: DeliveryNote }>(`/delivery-notes/${id}/cancel`);
    return data.data;
  },

  delete: (id: string) => api.delete(`/delivery-notes/${id}`),
};
