import { useCallback } from 'react';
import { Modal, App } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { salesInvoicesApi, SalesInvoice } from '@lib/api/endpoints/sales-invoices';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  confirmed: 'green',
  cancelled: 'red',
};

export default function SalesInvoicesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<SalesInvoice>({
    fetchFn: (params) => salesInvoicesApi.getAll(params as Record<string, string>),
    storageKey: 'sales-invoices-list-columns',
    columnKeys: ['invoiceNumber', 'invoiceDate', 'dueDate', 'customer', 'status', 'total'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await salesInvoicesApi.delete(id);
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
      title: t('salesInvoices.invoiceNumber'),
      key: 'invoiceNumber',
      dataIndex: 'invoiceNumber',
      sorter: true,
      width: 130,
    },
    {
      title: t('salesInvoices.invoiceDate'),
      key: 'invoiceDate',
      dataIndex: 'invoiceDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('salesInvoices.dueDate'),
      key: 'dueDate',
      dataIndex: 'dueDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('salesInvoices.customer'),
      key: 'customer',
      width: 200,
      render: (_: unknown, r: SalesInvoice) => r.customerName || '-',
    },
    {
      title: t('salesInvoices.status'),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <OdooTag color={STATUS_COLORS[v] || 'default'}>{t(`salesInvoices.status_${v}`)}</OdooTag>
      ),
    },
    {
      title: t('salesInvoices.total'),
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
      <DataGrid<SalesInvoice>
        {...grid}
        title={t('menu.salesInvoices')}
        icon={<FileTextOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'invoiceNumber', label: t('salesInvoices.invoiceNumber') },
          { key: 'invoiceDate', label: t('salesInvoices.invoiceDate') },
          { key: 'dueDate', label: t('salesInvoices.dueDate') },
          { key: 'customer', label: t('salesInvoices.customer') },
          { key: 'status', label: t('salesInvoices.status') },
          { key: 'total', label: t('salesInvoices.total') },
        ]}
        basePath="sales-invoices"
        onRowClick={(r) => navigate(`/sales-invoices/${r.id}/edit`)}
        onCreate={() => navigate('/sales-invoices/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
