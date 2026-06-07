import { Card, Col, Row, Statistic, Typography } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <div>
      <Title level={3}>{t('dashboard.welcome', { name: user?.fullName ?? user?.email ?? '' })}</Title>
      <Text type="secondary">{t('dashboard.subtitle')}</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title={t('dashboard.totalSales')} value={0} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title={t('dashboard.totalOrders')} value={0} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title={t('dashboard.totalCustomers')} value={0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title={t('dashboard.totalInvoices')} value={0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
