import { Layout, Space, Typography, theme } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';

const { Header } = Layout;
const { Text } = Typography;

export function AppHeader() {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Space size={10}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SafetyCertificateOutlined style={{ fontSize: 16, color: '#fff' }} />
        </div>
        <Text strong style={{ fontSize: 16 }}>
          {t('app.shortName')}
        </Text>
      </Space>
      <Space size="middle">
        <LanguageSwitcher />
        <ThemeToggle />
        <UserMenu />
      </Space>
    </Header>
  );
}
