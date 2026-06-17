import { useCallback } from 'react';
import { Modal } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { branchesApi, BranchItem } from '@lib/api/endpoints/branches';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function BranchesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const grid = useDataGrid<BranchItem>({
    fetchFn: (params) => branchesApi.findAll(params as Record<string, unknown>),
    storageKey: 'branches-list-columns',
    columnKeys: ['name', 'code', 'isDefault', 'isActive'],
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await branchesApi.remove(id);
          }
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [t, grid],
  );

  const columns = [
    { title: t('branches.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    { title: t('branches.code'), key: 'code', dataIndex: 'code', sorter: true, width: 120 },
    {
      title: t('branches.default'),
      key: 'isDefault',
      width: 100,
      render: (_: unknown, record: BranchItem) =>
        record.isDefault ? <OdooTag color="blue">{t('common.yes')}</OdooTag> : '-',
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      width: 100,
      render: (v: boolean) =>
        v ? (
          <OdooTag color="green">{t('common.active')}</OdooTag>
        ) : (
          <OdooTag color="red">{t('common.inactive')}</OdooTag>
        ),
    },
  ];

  return (
    <div className="erpnext-list">
      <DataGrid<BranchItem>
        {...grid}
        title={t('menu.branches')}
        icon={<BankOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'name', label: t('branches.name') },
          { key: 'code', label: t('branches.code') },
          { key: 'isDefault', label: t('branches.default') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="branches"
        onRowClick={(branch) => navigate(`/branches/${branch.id}/edit`)}
        onCreate={() => navigate('/branches/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
