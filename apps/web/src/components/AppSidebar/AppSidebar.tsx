import { Layout, Menu, MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  HistoryOutlined,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  PercentageOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ZoomInOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCan } from '@lib/permissions/useCan';
import { useState } from 'react';

const { Sider } = Layout;

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const path = location.pathname;
    if (
      path.startsWith('/fiscal-years') ||
      path.startsWith('/chart-of-accounts') ||
      path.startsWith('/journal-entries') ||
      path.startsWith('/taxes')
    ) {
      return ['finance'];
    }
    if (
      path.startsWith('/warehouses') ||
      path.startsWith('/items') ||
      path.startsWith('/units-of-measure') ||
      path.startsWith('/item-groups')
    ) {
      return ['inventory'];
    }
    return [];
  });
  const canReadUsers = useCan('read', 'User');
  const canReadRoles = useCan('read', 'Role');
  const canReadAudit = useCan('read', 'AuditLog');
  const canReadBranches = useCan('read', 'Branch');
  const canReadFiscalYears = useCan('read', 'FiscalYear');
  const canReadAccounts = useCan('read', 'Account');
  const canReadJournalEntries = useCan('read', 'JournalEntry');
  const canReadTaxes = useCan('read', 'Tax');
  const canReadWarehouses = useCan('read', 'Warehouse');
  const canReadItems = useCan('read', 'Item');
  const canReadUnitsOfMeasure = useCan('read', 'UnitOfMeasure');
  const canReadItemGroups = useCan('read', 'ItemGroup');

  const hasFinance = canReadFiscalYears || canReadAccounts || canReadJournalEntries || canReadTaxes;
  const hasInventory =
    canReadWarehouses || canReadItems || canReadUnitsOfMeasure || canReadItemGroups;

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
    ...(canReadBranches
      ? [
          {
            key: '/branches',
            icon: <BankOutlined />,
            label: t('menu.branches'),
          },
        ]
      : []),
    ...(hasFinance
      ? [
          {
            key: 'finance',
            icon: <DollarOutlined />,
            label: t('menu.finance'),
            children: [
              ...(canReadFiscalYears
                ? [
                    {
                      key: '/fiscal-years',
                      icon: <CalendarOutlined />,
                      label: t('menu.fiscalYears'),
                    },
                  ]
                : []),
              ...(canReadAccounts
                ? [
                    {
                      key: '/chart-of-accounts',
                      icon: <BookOutlined />,
                      label: t('menu.chartOfAccounts'),
                    },
                  ]
                : []),
              ...(canReadJournalEntries
                ? [
                    {
                      key: '/journal-entries',
                      icon: <FileTextOutlined />,
                      label: t('menu.journalEntries'),
                    },
                  ]
                : []),
              ...(canReadTaxes
                ? [{ key: '/taxes', icon: <PercentageOutlined />, label: t('menu.taxes') }]
                : []),
            ],
          },
        ]
      : []),
    ...(hasInventory
      ? [
          {
            key: 'inventory',
            icon: <AppstoreOutlined />,
            label: t('menu.inventory'),
            children: [
              ...(canReadWarehouses
                ? [{ key: '/warehouses', icon: <HomeOutlined />, label: t('menu.warehouses') }]
                : []),
              ...(canReadItems
                ? [{ key: '/items', icon: <AppstoreOutlined />, label: t('menu.items') }]
                : []),
              ...(canReadUnitsOfMeasure
                ? [
                    {
                      key: '/units-of-measure',
                      icon: <ZoomInOutlined />,
                      label: t('menu.unitsOfMeasure'),
                    },
                  ]
                : []),
              ...(canReadItemGroups
                ? [{ key: '/item-groups', icon: <TagsOutlined />, label: t('menu.itemGroups') }]
                : []),
            ],
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
  ];

  return (
    <Sider width={220} theme="light">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        onClick={({ key }) => navigate(key)}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  );
}
