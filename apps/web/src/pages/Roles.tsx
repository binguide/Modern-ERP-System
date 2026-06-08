import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Card, Modal, App, Popover, Tag } from 'antd';
import { SafetyOutlined, PlusOutlined, SyncOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { rolesApi, RoleItem, QueryRolesParams } from '@lib/api/endpoints/roles';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getActionColor } from '@lib/tag-colors';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { TableMenu } from '@components/TableMenu/TableMenu';
import { useColumnVisibility } from '@lib/hooks/useColumnVisibility';
import { transformToTreeData, isGroupRow, GroupConfig, TableRow } from '@lib/table-utils';

dayjs.extend(relativeTime);

function getGroupConfig(field: string, t: (key: string) => string): GroupConfig<RoleItem> {
  if (field === 'isSystem') {
    return {
      getGroupValue: (item) => (item.isSystem ? 'system' : 'custom'),
      getGroupLabel: (v) => (v === 'system' ? t('roles.system') : t('roles.custom')),
    };
  }
  throw new Error(`Unknown group field: ${field}`);
}

export default function RolesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RoleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<QueryRolesParams>({ page: 1, limit: 20 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);

  const COLUMN_LABELS: Array<{ key: string; label: string }> = [
    { key: 'code', label: t('roles.code') },
    { key: 'name', label: t('roles.name') },
    { key: 'description', label: t('roles.description') },
    { key: 'permissions', label: t('roles.permissions') },
    { key: 'isSystem', label: t('roles.type') },
  ];

  const { visibleColumns, toggleColumn, resetColumns } = useColumnVisibility(
    'roles-list-columns',
    COLUMN_LABELS.map((c) => c.key),
  );

  const GROUP_OPTIONS = [{ value: 'isSystem', label: t('roles.type') }];

  const activeConfigs = groupBy
    .map((f) => getGroupConfig(f, t))
    .filter(Boolean) as GroupConfig<RoleItem>[];

  const isGrouped = activeConfigs.length > 0;

  const groupLabels: Record<string, string> = {};
  for (const o of GROUP_OPTIONS) groupLabels[o.value] = o.label;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await rolesApi.findAll(params);
      setData(result.data);
      setTotal(result.total);
    } catch {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [params, message, t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const tableData: TableRow<RoleItem>[] = isGrouped
    ? transformToTreeData(data, activeConfigs)
    : data;

  const handleDeleteSelected = () => {
    const systemSelected = data.filter((r) => selectedIds.includes(r.id) && r.isSystem);
    if (systemSelected.length > 0) {
      message.warning(t('roles.cannotDeleteSystem'));
      return;
    }
    Modal.confirm({
      title: t('common.confirmDelete'),
      content: t('roles.confirmDeleteSelected', { count: selectedIds.length }),
      onOk: async () => {
        for (const id of selectedIds) {
          await rolesApi.remove(id);
        }
        message.success(t('common.deleted'));
        setSelectedIds([]);
        void fetchData();
      },
    });
  };

  const handleTableChange = (
    _pagination: unknown,
    _filters: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sorter: any,
  ) => {
    setSelectedIds([]);
    const order =
      sorter.order === 'ascend' ? 'ASC' : sorter.order === 'descend' ? 'DESC' : undefined;
    setParams((prev) => ({
      ...prev,
      sortBy: order ? sorter.field : undefined,
      sortOrder: order,
      page: 1,
    }));
  };

  const toggleGroup = (field: string) => {
    setGroupBy((prev) =>
      prev.includes(field) ? prev.filter((k) => k !== field) : [...prev, field],
    );
    setSelectedIds([]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const menuColumn: any = {
    key: '__menu__',
    width: 40,
    fixed: 'right',
    title: (
      <TableMenu
        columns={COLUMN_LABELS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onResetColumns={resetColumns}
        groupOptions={GROUP_OPTIONS}
        groupBy={groupBy}
        onToggleGroup={toggleGroup}
      />
    ),
    onCell: (record: TableRow<RoleItem>) => {
      if (isGroupRow(record)) return { colSpan: 0 };
      return {};
    },
    render: () => null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allDataColumns: any[] = [
    {
      title: t('roles.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      sortOrder:
        params.sortBy === 'code'
          ? params.sortOrder === 'ASC'
            ? ('ascend' as const)
            : ('descend' as const)
          : undefined,
      onCell: (record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) return { colSpan: columns.length };
        return {};
      },
      render: (_: unknown, record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) {
          return (
            <div className="odoo-group-label">
              <strong className="group-label-name">{record.__groupLabel}</strong>
              <span className="group-label-count">{record.__groupCount}</span>
            </div>
          );
        }
        return (record as RoleItem).code;
      },
    },
    {
      title: t('roles.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortOrder:
        params.sortBy === 'name'
          ? params.sortOrder === 'ASC'
            ? ('ascend' as const)
            : ('descend' as const)
          : undefined,
      onCell: (record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
    },
    {
      title: t('roles.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      responsive: ['md' as const],
      onCell: (record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
    },
    {
      title: t('roles.permissions'),
      key: 'permissions',
      responsive: ['lg' as const],
      onCell: (record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
      render: (_: unknown, record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) return null;
        const r = record as RoleItem;
        const visible = r.permissions.slice(0, 5);
        const rest = r.permissions.slice(5);
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
      sortOrder:
        params.sortBy === 'isSystem'
          ? params.sortOrder === 'ASC'
            ? ('ascend' as const)
            : ('descend' as const)
          : undefined,
      onCell: (record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
      render: (_: unknown, record: TableRow<RoleItem>) => {
        if (isGroupRow(record)) return null;
        return (record as RoleItem).isSystem ? (
          <OdooTag color="orange">{t('roles.system')}</OdooTag>
        ) : (
          <OdooTag color="default">{t('roles.custom')}</OdooTag>
        );
      },
    },
  ];

  const columns = [...allDataColumns.filter((col) => visibleColumns.includes(col.key)), menuColumn];

  return (
    <Card
      title={
        <>
          <SafetyOutlined style={{ marginInlineEnd: 8 }} />
          {t('menu.roles')}
        </>
      }
      extra={
        <Space>
          {selectedIds.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteSelected}>
              {t('common.deleteSelected', { count: selectedIds.length })}
            </Button>
          )}
          {groupBy.map((field) => (
            <Tag key={field} closable onClose={() => toggleGroup(field)} style={{ marginRight: 0 }}>
              {groupLabels[field]}
            </Tag>
          ))}
          <Button
            icon={<SyncOutlined />}
            onClick={() => {
              setSelectedIds([]);
              fetchData();
            }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/roles/new')}>
            {t('common.create')}
          </Button>
        </Space>
      }
    >
      <Table
        key={`table-${groupBy.join(',') || 'none'}`}
        dataSource={tableData as never[]}
        columns={columns}
        rowKey={(record) => {
          const r = record as TableRow<RoleItem> & { id?: string };
          return isGroupRow(r) ? r.key : r.id!;
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        showSorterTooltip={false}
        defaultExpandAllRows={isGrouped}
        rowSelection={{
          selectedRowKeys: selectedIds,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange: (keys) =>
            setSelectedIds(keys.filter((k) => !(k as string).startsWith('__group__')) as string[]),
        }}
        rowClassName={(record: TableRow<RoleItem>) => (isGroupRow(record) ? 'odoo-group-row' : '')}
        onRow={(record: TableRow<RoleItem>) => {
          if (isGroupRow(record)) return {};
          return {
            onClick: () => navigate(`/roles/${(record as RoleItem).id}/edit`),
            style: { cursor: 'pointer' },
          };
        }}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: isGrouped ? (tableData as never[]).length : total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          onChange: (page, limit) => {
            setSelectedIds([]);
            setParams({ ...params, page, limit });
          },
        }}
        locale={{
          emptyText: (
            <Space direction="vertical" style={{ padding: 24 }}>
              {t('common.noData')}
              <Button type="primary" onClick={() => navigate('/roles/new')}>
                {t('common.create')}
              </Button>
            </Space>
          ),
        }}
      />
    </Card>
  );
}
