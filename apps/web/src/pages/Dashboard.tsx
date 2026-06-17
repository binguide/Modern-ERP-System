import { lazy, Suspense } from 'react';
import { Card, Col, Row, Table, Tag, Typography, theme } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import {
  dashboardApi,
  type DashboardStats,
  type MonthlySales,
  type TopCustomer,
  type RecentOrder,
} from '@/lib/api/endpoints/dashboard';

const MonthlySalesChart = lazy(() => import('@components/DashboardCharts/MonthlySalesChart'));
const SalesPieChart = lazy(() => import('@components/DashboardCharts/SalesPieChart'));
const TopCustomersChart = lazy(() => import('@components/DashboardCharts/TopCustomersChart'));

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  draft: 'default',
  confirmed: 'processing',
  delivered: 'success',
  invoiced: 'purple',
  cancelled: 'error',
};

const statCardStyle = () => ({
  borderRadius: 14,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  border: 'none' as const,
});

const statIconStyle = (bg: string) => ({
  width: 48,
  height: 48,
  borderRadius: 14,
  background: bg,
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  fontSize: 22,
});

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { token } = theme.useToken();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: monthlySales } = useQuery<MonthlySales[]>({
    queryKey: ['dashboard-monthly-sales'],
    queryFn: () => dashboardApi.getMonthlySales(),
  });

  const { data: topCustomers } = useQuery<TopCustomer[]>({
    queryKey: ['dashboard-top-customers'],
    queryFn: () => dashboardApi.getTopCustomers(),
  });

  const { data: recentOrders } = useQuery<RecentOrder[]>({
    queryKey: ['dashboard-recent-orders'],
    queryFn: () => dashboardApi.getRecentOrders(),
  });

  const recentColumns = [
    { title: t('salesOrders.orderNumber'), dataIndex: 'orderNumber', key: 'orderNumber' },
    {
      title: t('salesOrders.customer'),
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: { name: string } | undefined) => customer?.name ?? '-',
    },
    {
      title: t('salesOrders.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{t(`salesOrders.status_${status}`)}</Tag>
      ),
    },
    {
      title: t('salesOrders.total'),
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
      render: (val: number) => Number(val).toLocaleString(),
    },
  ];

  const pieData = (stats?.salesByStatus ?? []).map((s: { status: string; count: number }) => ({
    type: t(`salesOrders.status_${s.status}`),
    value: s.count,
  }));

  const barData = (monthlySales ?? []).map((s: MonthlySales) => ({
    month: s.month,
    total: s.total,
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('app.dashboard')}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          {t('auth.welcome', { name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') })}
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            loading={statsLoading}
            style={statCardStyle()}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                  {t('dashboard.totalSales')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                  {stats?.yearSales?.toLocaleString() ?? '0'}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>SAR</div>
              </div>
              <div style={statIconStyle('rgba(255,255,255,0.15)')}>
                <DollarOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            loading={statsLoading}
            style={statCardStyle()}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                  {t('dashboard.revenue')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                  {stats?.monthSales?.toLocaleString() ?? '0'}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>SAR</div>
              </div>
              <div style={statIconStyle('rgba(255,255,255,0.15)')}>
                <ShoppingCartOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            loading={statsLoading}
            style={statCardStyle()}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                  {t('dashboard.activeUsers')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                  {stats?.totalUsers ?? 0}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>{t('users.status')}</div>
              </div>
              <div style={statIconStyle('rgba(255,255,255,0.15)')}>
                <UserOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            loading={statsLoading}
            style={statCardStyle()}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                  {t('dashboard.orders')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                  {stats?.totalSalesOrders ?? 0}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                  {t('common.total', { count: 0 })}
                </div>
              </div>
              <div style={statIconStyle('rgba(255,255,255,0.15)')}>
                <AppstoreOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ fontWeight: 600 }}>{t('dashboard.monthlySales')}</span>}
            headStyle={{
              borderBottom: '1px solid ' + token.colorBorderSecondary,
              padding: '16px 20px',
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Suspense fallback={<div style={{ height: 300 }} />}>
              <MonthlySalesChart data={barData} />
            </Suspense>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ fontWeight: 600 }}>{t('dashboard.salesByStatus')}</span>}
            headStyle={{
              borderBottom: '1px solid ' + token.colorBorderSecondary,
              padding: '16px 20px',
            }}
            bodyStyle={{ padding: 20 }}
          >
            {pieData.length > 0 ? (
              <Suspense fallback={<div style={{ height: 300 }} />}>
                <SalesPieChart data={pieData} />
              </Suspense>
            ) : (
              <Text
                type="secondary"
                style={{ display: 'block', textAlign: 'center', padding: '40px 0' }}
              >
                {t('common.noData')}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600 }}>{t('dashboard.topCustomers')}</span>}
            headStyle={{
              borderBottom: '1px solid ' + token.colorBorderSecondary,
              padding: '16px 20px',
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Suspense fallback={<div style={{ height: 280 }} />}>
              <TopCustomersChart data={topCustomers ?? []} />
            </Suspense>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600 }}>{t('dashboard.recentOrders')}</span>}
            headStyle={{
              borderBottom: '1px solid ' + token.colorBorderSecondary,
              padding: '16px 20px',
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Table
              dataSource={recentOrders ?? []}
              columns={recentColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={!recentOrders}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
