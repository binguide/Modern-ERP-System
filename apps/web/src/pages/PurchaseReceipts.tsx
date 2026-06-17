import { useCallback } from 'react';
import { Modal, App } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { purchaseReceiptsApi, PurchaseReceipt } from '@lib/api/endpoints/purchase-receipts';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  confirmed: 'green',
  cancelled: 'red',
};

export default function PurchaseReceiptsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<PurchaseReceipt>({
    fetchFn: (params) => purchaseReceiptsApi.getAll(params as Record<string, string>),
    storageKey: 'purchase-receipts-list-columns',
    columnKeys: ['receiptNumber', 'receiptDate', 'supplier', 'status', 'total'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await purchaseReceiptsApi.delete(id);
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
      title: t('purchaseReceipts.receiptNumber'),
      key: 'receiptNumber',
      dataIndex: 'receiptNumber',
      sorter: true,
      width: 130,
    },
    {
      title: t('purchaseReceipts.receiptDate'),
      key: 'receiptDate',
      dataIndex: 'receiptDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('purchaseReceipts.supplier'),
      key: 'supplier',
      width: 200,
      render: (_: unknown, r: PurchaseReceipt) => r.supplierName || '-',
    },
    {
      title: t('purchaseReceipts.status'),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <OdooTag color={STATUS_COLORS[v] || 'default'}>{t(`purchaseReceipts.status_${v}`)}</OdooTag>
      ),
    },
    {
      title: t('purchaseReceipts.total'),
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
      <DataGrid<PurchaseReceipt>
        {...grid}
        title={t('menu.purchaseReceipts')}
        icon={<ImportOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'receiptNumber', label: t('purchaseReceipts.receiptNumber') },
          { key: 'receiptDate', label: t('purchaseReceipts.receiptDate') },
          { key: 'supplier', label: t('purchaseReceipts.supplier') },
          { key: 'status', label: t('purchaseReceipts.status') },
          { key: 'total', label: t('purchaseReceipts.total') },
        ]}
        basePath="purchase-receipts"
        onRowClick={(r) => navigate(`/purchase-receipts/${r.id}/edit`)}
        onCreate={() => navigate('/purchase-receipts/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
