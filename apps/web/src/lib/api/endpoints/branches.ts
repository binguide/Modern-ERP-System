import { api } from '../axios';

export interface BranchItem {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  isActive: boolean;
}

export const branchesApi = {
  findAll: async () => {
    const { data } = await api.get<{ data: BranchItem[] }>('/branches');
    return data.data;
  },
};
