import { api } from '../axios';

export interface AuditLogEntry {
  id: string;
  companyId: string | null;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const auditApi = {
  findAll: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    resource?: string;
    action?: string;
  }): Promise<PaginatedResponse<AuditLogEntry>> => {
    const { data } = await api.get<{ data: PaginatedResponse<AuditLogEntry> }>('/audit-logs', {
      params,
    });
    return data.data;
  },
};
