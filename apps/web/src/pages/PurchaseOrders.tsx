import { useCallback } from 'react';
import { Modal, App } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { purchaseOrdersApi, PurchaseOrderItem } from '@lib/api/endpoints/purchase-orders';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  saved: 'blue',
  confirmed: 'green',
  cancelled: 'red',
};

export default function PurchaseOrdersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<PurchaseOrderItem>({
    fetchFn: (params) => purchaseOrdersApi.findAll(params as Record<string, unknown>),
    storageKey: 'purchase-orders-list-columns',
    columnKeys: ['orderNumber', 'orderDate', 'supplier', 'status', 'total'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await purchaseOrdersApi.remove(id);
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
      title: t('purchaseOrders.orderNumber'),
      key: 'orderNumber',
      dataIndex: 'orderNumber',
      sorter: true,
      width: 130,
    },
    {
      title: t('purchaseOrders.orderDate'),
      key: 'orderDate',
      dataIndex: 'orderDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('purchaseOrders.supplier'),
      key: 'supplier',
      width: 200,
      render: (_: unknown, r: PurchaseOrderItem) => r.supplier?.name || '-',
    },
    {
      title: t('purchaseOrders.status'),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <OdooTag color={STATUS_COLORS[v] || 'default'}>{t(`purchaseOrders.status_${v}`)}</OdooTag>
      ),
    },
    {
      title: t('purchaseOrders.total'),
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
      <DataGrid<PurchaseOrderItem>
        {...grid}
        title={t('menu.purchaseOrders')}
        icon={<ShoppingCartOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'orderNumber', label: t('purchaseOrders.orderNumber') },
          { key: 'orderDate', label: t('purchaseOrders.orderDate') },
          { key: 'supplier', label: t('purchaseOrders.supplier') },
          { key: 'status', label: t('purchaseOrders.status') },
          { key: 'total', label: t('purchaseOrders.total') },
        ]}
        basePath="purchase-orders"
        onRowClick={(r) => navigate(`/purchase-orders/${r.id}/edit`)}
        onCreate={() => navigate('/purchase-orders/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
