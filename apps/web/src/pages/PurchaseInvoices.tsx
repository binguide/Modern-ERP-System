import { useCallback } from 'react';
import { Modal, App } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { purchaseInvoicesApi, PurchaseInvoice } from '@lib/api/endpoints/purchase-invoices';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  confirmed: 'green',
  cancelled: 'red',
};

export default function PurchaseInvoicesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<PurchaseInvoice>({
    fetchFn: (params) => purchaseInvoicesApi.getAll(params as Record<string, string>),
    storageKey: 'purchase-invoices-list-columns',
    columnKeys: ['invoiceNumber', 'invoiceDate', 'dueDate', 'supplier', 'status', 'total'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await purchaseInvoicesApi.delete(id);
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
      title: t('purchaseInvoices.invoiceNumber'),
      key: 'invoiceNumber',
      dataIndex: 'invoiceNumber',
      sorter: true,
      width: 130,
    },
    {
      title: t('purchaseInvoices.invoiceDate'),
      key: 'invoiceDate',
      dataIndex: 'invoiceDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('purchaseInvoices.dueDate'),
      key: 'dueDate',
      dataIndex: 'dueDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('purchaseInvoices.supplier'),
      key: 'supplier',
      width: 200,
      render: (_: unknown, r: PurchaseInvoice) => r.supplierName || '-',
    },
    {
      title: t('purchaseInvoices.status'),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <OdooTag color={STATUS_COLORS[v] || 'default'}>{t(`purchaseInvoices.status_${v}`)}</OdooTag>
      ),
    },
    {
      title: t('purchaseInvoices.total'),
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
      <DataGrid<PurchaseInvoice>
        {...grid}
        title={t('menu.purchaseInvoices')}
        icon={<FileTextOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'invoiceNumber', label: t('purchaseInvoices.invoiceNumber') },
          { key: 'invoiceDate', label: t('purchaseInvoices.invoiceDate') },
          { key: 'dueDate', label: t('purchaseInvoices.dueDate') },
          { key: 'supplier', label: t('purchaseInvoices.supplier') },
          { key: 'status', label: t('purchaseInvoices.status') },
          { key: 'total', label: t('purchaseInvoices.total') },
        ]}
        basePath="purchase-invoices"
        onRowClick={(r) => navigate(`/purchase-invoices/${r.id}/edit`)}
        onCreate={() => navigate('/purchase-invoices/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
