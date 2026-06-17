import { api } from '../axios';

export interface DashboardStats {
  totalSalesOrders: number;
  totalCustomers: number;
  totalUsers: number;
  totalItems: number;
  monthSales: number;
  yearSales: number;
  salesByStatus: Array<{ status: string; count: number }>;
}

export interface MonthlySales {
  month: string;
  total: number;
  count: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  total: number;
  orderCount: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  customer?: { id: string; code: string; name: string };
  status: string;
  total: number;
  createdAt: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<{ data: DashboardStats }>('/dashboard/stats');
    return data.data;
  },
  getMonthlySales: async (year?: number): Promise<MonthlySales[]> => {
    const { data } = await api.get<{ data: MonthlySales[] }>('/dashboard/monthly-sales', {
      params: { year },
    });
    return data.data;
  },
  getTopCustomers: async (limit?: number): Promise<TopCustomer[]> => {
    const { data } = await api.get<{ data: TopCustomer[] }>('/dashboard/top-customers', {
      params: { limit },
    });
    return data.data;
  },
  getRecentOrders: async (limit?: number): Promise<RecentOrder[]> => {
    const { data } = await api.get<{ data: RecentOrder[] }>('/dashboard/recent-orders', {
      params: { limit },
    });
    return data.data;
  },
};
