import { Avatar, Dropdown, MenuProps, Space, theme } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: t('user.profile'),
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      onClick: async () => {
        await logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Space style={{ cursor: 'pointer', color: token.colorText }}>
        <Avatar
          size="small"
          icon={<UserOutlined />}
          style={{ backgroundColor: token.colorPrimary }}
        />
        <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
          {user ? `${user.firstName} ${user.lastName}` : t('common.guest')}
        </span>
      </Space>
    </Dropdown>
  );
}
