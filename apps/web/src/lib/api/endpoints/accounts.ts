import { api } from '../axios';

export interface AccountItem {
  id: string;
  code: string;
  name: string;
  nameEn?: string | null;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentId?: string | null;
  isActive: boolean;
  openingBalance: number;
  currentBalance: number;
  children?: AccountItem[];
}

export interface CreateAccountPayload {
  code: string;
  name: string;
  nameEn?: string;
  type: string;
  parentId?: string;
  isActive?: boolean;
  openingBalance?: number;
}

export interface UpdateAccountPayload {
  code?: string;
  name?: string;
  nameEn?: string;
  type?: string;
  parentId?: string;
  isActive?: boolean;
  openingBalance?: number;
}

export interface QueryAccountsParams {
  search?: string;
  type?: string;
  isActive?: boolean;
}

export const accountsApi = {
  create: async (payload: CreateAccountPayload): Promise<AccountItem> => {
    const { data } = await api.post<{ data: AccountItem }>('/accounts', payload);
    return data.data;
  },
  findAll: async (params?: QueryAccountsParams): Promise<AccountItem[]> => {
    const { data } = await api.get<{ data: AccountItem[] }>('/accounts', { params });
    return data.data;
  },
  findTree: async (): Promise<AccountItem[]> => {
    const { data } = await api.get<{ data: AccountItem[] }>('/accounts/tree');
    return data.data;
  },
  findById: async (id: string): Promise<AccountItem> => {
    const { data } = await api.get<{ data: AccountItem }>(`/accounts/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateAccountPayload): Promise<AccountItem> => {
    const { data } = await api.put<{ data: AccountItem }>(`/accounts/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },
};
