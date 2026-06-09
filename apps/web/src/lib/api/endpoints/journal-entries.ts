import { api } from '../axios';

export interface JournalEntryLineItem {
  id: string;
  accountId: string;
  description?: string | null;
  debit: number;
  credit: number;
  account?: { id: string; code: string; name: string };
}

export interface JournalEntryItem {
  id: string;
  number: number;
  date: string;
  description?: string | null;
  fiscalYearId: string;
  periodId: string;
  status: 'draft' | 'posted' | 'cancelled';
  reference?: string | null;
  totalDebit: number;
  totalCredit: number;
  lines?: JournalEntryLineItem[];
  fiscalYear?: { code: string };
  period?: { name: string };
}

export interface JournalEntryLinePayload {
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface CreateJournalEntryPayload {
  date: string;
  description?: string;
  fiscalYearId: string;
  periodId: string;
  reference?: string;
  lines: JournalEntryLinePayload[];
}

export interface UpdateJournalEntryPayload {
  date?: string;
  description?: string;
  fiscalYearId?: string;
  periodId?: string;
  reference?: string;
  lines?: JournalEntryLinePayload[];
}

export interface QueryJournalEntriesParams {
  fiscalYearId?: string;
  periodId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const journalEntriesApi = {
  create: async (payload: CreateJournalEntryPayload): Promise<JournalEntryItem> => {
    const { data } = await api.post<{ data: JournalEntryItem }>('/journal-entries', payload);
    return data.data;
  },
  findAll: async (
    params?: QueryJournalEntriesParams,
  ): Promise<PaginatedResponse<JournalEntryItem>> => {
    const { data } = await api.get<{ data: PaginatedResponse<JournalEntryItem> }>(
      '/journal-entries',
      { params },
    );
    return data.data;
  },
  findById: async (id: string): Promise<JournalEntryItem> => {
    const { data } = await api.get<{ data: JournalEntryItem }>(`/journal-entries/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateJournalEntryPayload): Promise<JournalEntryItem> => {
    const { data } = await api.put<{ data: JournalEntryItem }>(`/journal-entries/${id}`, payload);
    return data.data;
  },
  post: async (id: string): Promise<JournalEntryItem> => {
    const { data } = await api.post<{ data: JournalEntryItem }>(`/journal-entries/${id}/post`);
    return data.data;
  },
  cancel: async (id: string): Promise<JournalEntryItem> => {
    const { data } = await api.post<{ data: JournalEntryItem }>(`/journal-entries/${id}/cancel`);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/journal-entries/${id}`);
  },
};
