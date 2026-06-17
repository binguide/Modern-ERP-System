import { useCallback } from 'react';
import { Modal, App } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { salesOrdersApi, SalesOrderItem } from '@lib/api/endpoints/sales-orders';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  saved: 'blue',
  confirmed: 'green',
  cancelled: 'red',
};

export default function SalesOrdersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<SalesOrderItem>({
    fetchFn: (params) => salesOrdersApi.findAll(params as Record<string, unknown>),
    storageKey: 'sales-orders-list-columns',
    columnKeys: ['orderNumber', 'orderDate', 'customer', 'status', 'total'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await salesOrdersApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const columns = [
    {
      title: t('salesOrders.orderNumber'),
      key: 'orderNumber',
      dataIndex: 'orderNumber',
      sorter: true,
      width: 130,
    },
    {
      title: t('salesOrders.orderDate'),
      key: 'orderDate',
      dataIndex: 'orderDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('salesOrders.customer'),
      key: 'customer',
      width: 200,
      render: (_: unknown, r: SalesOrderItem) => r.customer?.name || '-',
    },
    {
      title: t('salesOrders.status'),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <OdooTag color={STATUS_COLORS[v] || 'default'}>{t(`salesOrders.status_${v}`)}</OdooTag>
      ),
    },
    {
      title: t('salesOrders.total'),
      key: 'total',
      dataIndex: 'total',
      sorter: true,
      width: 130,
      align: 'right' as const,
      render: (v: number) => v.toLocaleString('ar-SA', { minimumFractionDigits: 2 }),
    },
  ];

  return (
    <div className="erpnext-list">
      <DataGrid<SalesOrderItem>
        {...grid}
        title={t('menu.salesOrders')}
        icon={<ShoppingCartOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'orderNumber', label: t('salesOrders.orderNumber') },
          { key: 'orderDate', label: t('salesOrders.orderDate') },
          { key: 'customer', label: t('salesOrders.customer') },
          { key: 'status', label: t('salesOrders.status') },
          { key: 'total', label: t('salesOrders.total') },
        ]}
        basePath="sales-orders"
        onRowClick={(r) => navigate(`/sales-orders/${r.id}/edit`)}
        onCreate={() => navigate('/sales-orders/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
