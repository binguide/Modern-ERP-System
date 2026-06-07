import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
const ACCESS_TOKEN_KEY = 'erp_access_token';

export const tokenStorage = {
  get: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
};

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Array<{ field: string; message: string }>;
  path?: string;
  timestamp?: string;
}

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  }
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}
