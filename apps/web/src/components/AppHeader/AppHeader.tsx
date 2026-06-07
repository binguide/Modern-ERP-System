import { Layout, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';

const { Header } = Layout;
const { Title } = Typography;

export function AppHeader() {
  const { t } = useTranslation();
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#001529',
      }}
    >
      <Title level={4} style={{ color: '#fff', margin: 0 }}>
        {t('app.name')}
      </Title>
      <Space size="large">
        <LanguageSwitcher />
        <UserMenu />
      </Space>
    </Header>
  );
}
