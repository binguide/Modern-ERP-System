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
  ShoppingCartOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ImportOutlined,
  ToolOutlined,
  CarOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCan } from '@lib/permissions/useCan';
import { useState } from 'react';
import { useAuthStore } from '@stores/authStore';

const { Sider } = Layout;

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
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
    if (
      path.startsWith('/customers') ||
      path.startsWith('/sales-orders') ||
      path.startsWith('/sales-invoices') ||
      path.startsWith('/delivery-notes') ||
      path.startsWith('/quotations')
    ) {
      return ['sales'];
    }
    if (
      path.startsWith('/suppliers') ||
      path.startsWith('/purchase-orders') ||
      path.startsWith('/purchase-receipts') ||
      path.startsWith('/purchase-invoices')
    ) {
      return ['purchases'];
    }
    if (path.startsWith('/asset-categories') || path.startsWith('/fixed-assets')) {
      return ['fixedAssets'];
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
  const canReadCustomers = useCan('read', 'Customer');
  const canReadSalesOrders = useCan('read', 'SalesOrder');
  const canReadSalesInvoices = useCan('read', 'SalesInvoice');
  const canReadDeliveryNotes = useCan('read', 'DeliveryNote');
  const canReadQuotations = useCan('read', 'Quotation');
  const canReadSuppliers = useCan('read', 'Supplier');
  const canReadPurchaseOrders = useCan('read', 'PurchaseOrder');
  const canReadPurchaseReceipts = useCan('read', 'PurchaseReceipt');
  const canReadPurchaseInvoices = useCan('read', 'PurchaseInvoice');
  const canReadAssetCategories = useCan('read', 'AssetCategory');
  const canReadFixedAssets = useCan('read', 'FixedAsset');

  const hasFinance = canReadFiscalYears || canReadAccounts || canReadJournalEntries || canReadTaxes;
  const hasInventory =
    canReadWarehouses || canReadItems || canReadUnitsOfMeasure || canReadItemGroups;
  const hasSales =
    canReadCustomers ||
    canReadSalesOrders ||
    canReadSalesInvoices ||
    canReadDeliveryNotes ||
    canReadQuotations;
  const hasPurchases =
    canReadSuppliers || canReadPurchaseOrders || canReadPurchaseReceipts || canReadPurchaseInvoices;
  const hasFixedAssets = canReadAssetCategories || canReadFixedAssets;

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
    ...(hasSales
      ? [
          {
            key: 'sales',
            icon: <ShoppingCartOutlined />,
            label: t('menu.sales'),
            children: [
              ...(canReadCustomers
                ? [{ key: '/customers', icon: <TeamOutlined />, label: t('menu.customers') }]
                : []),
              ...(canReadSalesOrders
                ? [
                    {
                      key: '/sales-orders',
                      icon: <ShoppingCartOutlined />,
                      label: t('menu.salesOrders'),
                    },
                  ]
                : []),
              ...(canReadSalesInvoices
                ? [
                    {
                      key: '/sales-invoices',
                      icon: <FileTextOutlined />,
                      label: t('menu.salesInvoices'),
                    },
                  ]
                : []),
              ...(canReadDeliveryNotes
                ? [
                    {
                      key: '/delivery-notes',
                      icon: <CarOutlined />,
                      label: t('menu.deliveryNotes'),
                    },
                  ]
                : []),
              ...(canReadQuotations
                ? [
                    {
                      key: '/quotations',
                      icon: <FileSearchOutlined />,
                      label: t('menu.quotations'),
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(hasPurchases
      ? [
          {
            key: 'purchases',
            icon: <ShoppingCartOutlined />,
            label: t('menu.purchases'),
            children: [
              ...(canReadSuppliers
                ? [{ key: '/suppliers', icon: <TeamOutlined />, label: t('menu.suppliers') }]
                : []),
              ...(canReadPurchaseOrders
                ? [
                    {
                      key: '/purchase-orders',
                      icon: <ShoppingCartOutlined />,
                      label: t('menu.purchaseOrders'),
                    },
                  ]
                : []),
              ...(canReadPurchaseReceipts
                ? [
                    {
                      key: '/purchase-receipts',
                      icon: <ImportOutlined />,
                      label: t('menu.purchaseReceipts'),
                    },
                  ]
                : []),
              ...(canReadPurchaseInvoices
                ? [
                    {
                      key: '/purchase-invoices',
                      icon: <FileTextOutlined />,
                      label: t('menu.purchaseInvoices'),
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(hasFixedAssets
      ? [
          {
            key: 'fixedAssets',
            icon: <ToolOutlined />,
            label: t('menu.fixedAssets'),
            children: [
              ...(canReadAssetCategories
                ? [
                    {
                      key: '/asset-categories',
                      icon: <AppstoreOutlined />,
                      label: t('menu.assetCategories'),
                    },
                  ]
                : []),
              ...(canReadFixedAssets
                ? [
                    {
                      key: '/fixed-assets',
                      icon: <ToolOutlined />,
                      label: t('menu.fixedAssets'),
                    },
                  ]
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
    <Sider
      width={240}
      style={{
        background: '#0f172a',
        height: 'calc(100vh - 56px)',
        position: 'sticky',
        top: 56,
        overflow: 'auto',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
              {t('app.name')}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>v1.0.0</div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '8px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          margin: '0 0 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 14,
              color: '#94a3b8',
            }}
          >
            {user?.firstName?.[0]?.toUpperCase() ?? <UserOutlined />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.firstName} {user?.lastName}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        onClick={({ key }) => navigate(key)}
        style={{
          background: 'transparent',
          borderRight: 0,
          color: 'rgba(255,255,255,0.65)',
        }}
        theme="dark"
      />
    </Sider>
  );
}
