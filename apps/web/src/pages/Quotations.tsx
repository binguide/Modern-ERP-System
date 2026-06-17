import { useCallback } from 'react';
import { Modal, App } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { quotationsApi, Quotation } from '@lib/api/endpoints/quotations';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  confirmed: 'green',
  cancelled: 'red',
};

export default function QuotationsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<Quotation>({
    fetchFn: (params) => quotationsApi.getAll(params as Record<string, string>),
    storageKey: 'quotations-list-columns',
    columnKeys: ['quotationNumber', 'quotationDate', 'validUntil', 'customer', 'status', 'total'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await quotationsApi.delete(id);
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
      title: t('quotations.quotationNumber'),
      key: 'quotationNumber',
      dataIndex: 'quotationNumber',
      sorter: true,
      width: 130,
    },
    {
      title: t('quotations.quotationDate'),
      key: 'quotationDate',
      dataIndex: 'quotationDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('quotations.validUntil'),
      key: 'validUntil',
      dataIndex: 'validUntil',
      sorter: true,
      width: 120,
    },
    {
      title: t('quotations.customer'),
      key: 'customer',
      width: 200,
      render: (_: unknown, r: Quotation) => r.customerName || '-',
    },
    {
      title: t('quotations.status'),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <OdooTag color={STATUS_COLORS[v] || 'default'}>{t(`quotations.status_${v}`)}</OdooTag>
      ),
    },
    {
      title: t('quotations.total'),
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
      <DataGrid<Quotation>
        {...grid}
        title={t('menu.quotations')}
        icon={<FileSearchOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'quotationNumber', label: t('quotations.quotationNumber') },
          { key: 'quotationDate', label: t('quotations.quotationDate') },
          { key: 'validUntil', label: t('quotations.validUntil') },
          { key: 'customer', label: t('quotations.customer') },
          { key: 'status', label: t('quotations.status') },
          { key: 'total', label: t('quotations.total') },
        ]}
        basePath="quotations"
        onRowClick={(r) => navigate(`/quotations/${r.id}/edit`)}
        onCreate={() => navigate('/quotations/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
