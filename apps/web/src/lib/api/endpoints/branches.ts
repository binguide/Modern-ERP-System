import { api } from '../axios';

export interface BranchItem {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateBranchPayload {
  name: string;
  code: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateBranchPayload {
  name?: string;
  code?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export const branchesApi = {
  create: async (payload: CreateBranchPayload): Promise<BranchItem> => {
    const { data } = await api.post<{ data: BranchItem }>('/branches', payload);
    return data.data;
  },
  findAll: async (): Promise<BranchItem[]> => {
    const { data } = await api.get<{ data: BranchItem[] }>('/branches');
    return data.data;
  },
  findById: async (id: string): Promise<BranchItem> => {
    const { data } = await api.get<{ data: BranchItem }>(`/branches/${id}`);
    return data.data;
  },
  update: async (id: string, payload: UpdateBranchPayload): Promise<BranchItem> => {
    const { data } = await api.put<{ data: BranchItem }>(`/branches/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/branches/${id}`);
  },
};
