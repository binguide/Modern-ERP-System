import { api } from '../axios';

export const uploadApi = {
  uploadItemImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ data: { url: string } }>('/upload/item-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};
