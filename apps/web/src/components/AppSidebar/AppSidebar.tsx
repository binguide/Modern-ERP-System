import { Layout, Menu, MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  HistoryOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCan } from '@lib/permissions/useCan';

const { Sider } = Layout;

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const canReadUsers = useCan('read', 'User');
  const canReadRoles = useCan('read', 'Role');
  const canReadAudit = useCan('read', 'AuditLog');
  const canReadBranches = useCan('read', 'Branch');

  const items: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    ...(canReadUsers
      ? [
          {
            key: '/users',
            icon: <UserOutlined />,
            label: t('menu.users'),
          },
        ]
      : []),
    ...(canReadRoles
      ? [
          {
            key: '/roles',
            icon: <SafetyOutlined />,
            label: t('menu.roles'),
          },
        ]
      : []),
    ...(canReadAudit
      ? [
          {
            key: '/audit-logs',
            icon: <HistoryOutlined />,
            label: t('menu.auditLogs'),
          },
        ]
      : []),
    ...(canReadBranches
      ? [
          {
            key: '/branches',
            icon: <BankOutlined />,
            label: t('menu.branches'),
          },
        ]
      : []),
  ];

  return (
    <Sider width={220} theme="light">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  );
}
