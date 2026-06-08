import { Card, Col, Row, Statistic, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
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
      <Title level={4} style={{ marginBottom: 24 }}>
        {t('app.dashboard')}
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
        {t('auth.welcome')}, {user?.firstName} {user?.lastName}
      </Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('dashboard.totalSales')}
              value={0}
              prefix={<ShoppingCartOutlined />}
              suffix="SAR"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('dashboard.revenue')}
              value={0}
              prefix={<DollarOutlined />}
              suffix="SAR"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.activeUsers')} value={0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title={t('dashboard.orders')} value={0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
