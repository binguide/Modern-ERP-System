import { Space, Popover, App, Modal } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { rolesApi, RoleItem } from '@lib/api/endpoints/roles';
import { getActionColor } from '@lib/tag-colors';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';
import type { GroupConfig } from '@lib/table-utils';

export default function RolesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const grid = useDataGrid<RoleItem>({
    fetchFn: (params) => rolesApi.findAll(params as Record<string, unknown>),
    storageKey: 'roles-list-columns',
    columnKeys: ['code', 'name', 'description', 'permissions', 'isSystem'],
    groupOptions: [{ value: 'isSystem', label: t('roles.type') }],
    getGroupConfig: () =>
      ({
        getGroupValue: (item) => (item.isSystem ? 'system' : 'custom'),
        getGroupLabel: (v) => (v === 'system' ? t('roles.system') : t('roles.custom')),
      }) as GroupConfig<RoleItem>,
  });

  const handleDeleteSelected = async (ids: string[]) => {
    const systemSelected = grid.data.filter((r) => ids.includes(r.id) && r.isSystem);
    if (systemSelected.length > 0) {
      message.warning(t('roles.cannotDeleteSystem'));
      return;
    }
    Modal.confirm({
      title: t('common.confirmDelete'),
      content: t('roles.confirmDeleteSelected', { count: ids.length }),
      onOk: async () => {
        for (const id of ids) {
          await rolesApi.remove(id);
        }
        message.success(t('common.deleted'));
        grid.clearSelection();
        grid.refresh();
      },
    });
  };

  const columns = [
    {
      title: t('roles.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
    },
    {
      title: t('roles.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: t('roles.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      responsive: ['md' as const],
    },
    {
      title: t('roles.permissions'),
      key: 'permissions',
      responsive: ['lg' as const],
      render: (_: unknown, record: RoleItem) => {
        const visible = record.permissions.slice(0, 5);
        const rest = record.permissions.slice(5);
        return (
          <Space size={4} wrap>
            {visible.map((p, i) => (
              <OdooTag key={i} color={getActionColor(p.action)}>
                {p.resource}
                <span style={{ opacity: 0.5, marginLeft: 3, fontSize: 12 }}>{p.action}</span>
              </OdooTag>
            ))}
            {rest.length > 0 && (
              <Popover
                title={t('roles.permissions')}
                content={
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 340 }}>
                    {rest.map((p, i) => (
                      <OdooTag key={i} color={getActionColor(p.action)}>
                        {p.resource}
                        <span style={{ opacity: 0.5, marginLeft: 3, fontSize: 12 }}>
                          {p.action}
                        </span>
                      </OdooTag>
                    ))}
                  </div>
                }
              >
                <OdooTag color="default" style={{ cursor: 'pointer' }}>
                  +{rest.length}
                </OdooTag>
              </Popover>
            )}
          </Space>
        );
      },
    },
    {
      title: t('roles.type'),
      dataIndex: 'isSystem',
      key: 'isSystem',
      sorter: true,
      render: (v: boolean) =>
        v ? (
          <OdooTag color="orange">{t('roles.system')}</OdooTag>
        ) : (
          <OdooTag color="default">{t('roles.custom')}</OdooTag>
        ),
    },
  ];

  return (
    <div className="erpnext-list">
      <DataGrid<RoleItem>
        {...grid}
        title={t('menu.roles')}
        icon={<SafetyOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('roles.code') },
          { key: 'name', label: t('roles.name') },
          { key: 'description', label: t('roles.description') },
          { key: 'permissions', label: t('roles.permissions') },
          { key: 'isSystem', label: t('roles.type') },
        ]}
        basePath="roles"
        groupOptions={[{ value: 'isSystem', label: t('roles.type') }]}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
