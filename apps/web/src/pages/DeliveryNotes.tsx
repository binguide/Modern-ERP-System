import { useCallback } from 'react';
import { Modal, App } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { deliveryNotesApi, DeliveryNote } from '@lib/api/endpoints/delivery-notes';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  confirmed: 'green',
  cancelled: 'red',
};

export default function DeliveryNotesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<DeliveryNote>({
    fetchFn: (params) => deliveryNotesApi.getAll(params as Record<string, string>),
    storageKey: 'delivery-notes-list-columns',
    columnKeys: ['deliveryNumber', 'deliveryDate', 'customer', 'status', 'total'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await deliveryNotesApi.delete(id);
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
      title: t('deliveryNotes.deliveryNumber'),
      key: 'deliveryNumber',
      dataIndex: 'deliveryNumber',
      sorter: true,
      width: 130,
    },
    {
      title: t('deliveryNotes.deliveryDate'),
      key: 'deliveryDate',
      dataIndex: 'deliveryDate',
      sorter: true,
      width: 120,
    },
    {
      title: t('deliveryNotes.customer'),
      key: 'customer',
      width: 200,
      render: (_: unknown, r: DeliveryNote) => r.customerName || '-',
    },
    {
      title: t('deliveryNotes.status'),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <OdooTag color={STATUS_COLORS[v] || 'default'}>{t(`deliveryNotes.status_${v}`)}</OdooTag>
      ),
    },
    {
      title: t('deliveryNotes.total'),
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
      <DataGrid<DeliveryNote>
        {...grid}
        title={t('menu.deliveryNotes')}
        icon={<CarOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'deliveryNumber', label: t('deliveryNotes.deliveryNumber') },
          { key: 'deliveryDate', label: t('deliveryNotes.deliveryDate') },
          { key: 'customer', label: t('deliveryNotes.customer') },
          { key: 'status', label: t('deliveryNotes.status') },
          { key: 'total', label: t('deliveryNotes.total') },
        ]}
        basePath="delivery-notes"
        onRowClick={(r) => navigate(`/delivery-notes/${r.id}/edit`)}
        onCreate={() => navigate('/delivery-notes/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
