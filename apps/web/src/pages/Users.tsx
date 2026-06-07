import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  App,
  Avatar,
  Tooltip,
  Popover,
  Modal,
  Tag,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  CrownOutlined,
  DeleteOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { usersApi, UserListItem, QueryUsersParams } from '@lib/api/endpoints/users';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getRoleColor } from '@lib/tag-colors';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { ColumnsButton } from '@components/ColumnsButton/ColumnsButton';
import { useColumnVisibility } from '@lib/hooks/useColumnVisibility';
import { transformToTreeData, isGroupRow, GroupConfig, TableRow } from '@lib/table-utils';

dayjs.extend(relativeTime);

function getGroupConfig(field: string, t: (key: string) => string): GroupConfig<UserListItem> {
  if (field === 'branch') {
    return {
      getGroupValue: (item) => item.branch?.name || t('common.noData'),
      getGroupLabel: (v) => v,
    };
  }
  if (field === 'isActive') {
    return {
      getGroupValue: (item) => (item.isActive ? 'active' : 'inactive'),
      getGroupLabel: (v) => (v === 'active' ? t('common.active') : t('common.inactive')),
    };
  }
  throw new Error(`Unknown group field: ${field}`);
}

export default function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<QueryUsersParams>({ page: 1, limit: 20 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);

  const COLUMN_LABELS: Array<{ key: string; label: string }> = [
    { key: 'firstName', label: t('users.name') },
    { key: 'email', label: t('auth.email') },
    { key: 'roles', label: t('users.roles') },
    { key: 'branch', label: t('users.branch') },
    { key: 'isActive', label: t('users.status') },
    { key: 'lastLoginAt', label: t('user.lastLogin') },
  ];

  const { visibleColumns, toggleColumn, resetColumns } = useColumnVisibility(
    'users-list-columns',
    COLUMN_LABELS.map((c) => c.key),
  );

  const GROUP_OPTIONS = [
    { value: 'branch', label: t('users.branch') },
    { value: 'isActive', label: t('users.status') },
  ];

  const activeConfigs = groupBy
    .map((f) => getGroupConfig(f, t))
    .filter(Boolean) as GroupConfig<UserListItem>[];

  const isGrouped = activeConfigs.length > 0;

  const groupLabels: Record<string, string> = {};
  for (const o of GROUP_OPTIONS) groupLabels[o.value] = o.label;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await usersApi.findAll(params);
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

  const tableData: TableRow<UserListItem>[] = isGrouped
    ? transformToTreeData(data, activeConfigs)
    : data;

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

  const handleDeleteSelected = () => {
    Modal.confirm({
      title: t('common.confirmDelete'),
      content: t('users.confirmDeleteSelected', { count: selectedIds.length }),
      onOk: async () => {
        for (const id of selectedIds) {
          await usersApi.remove(id);
        }
        message.success(t('common.deleted'));
        setSelectedIds([]);
        void fetchData();
      },
    });
  };

  const toggleGroup = (field: string) => {
    setGroupBy((prev) =>
      prev.includes(field) ? prev.filter((k) => k !== field) : [...prev, field],
    );
    setSelectedIds([]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allColumns: any[] = [
    {
      title: t('users.name'),
      key: 'firstName',
      sorter: true,
      sortOrder:
        params.sortBy === 'firstName'
          ? params.sortOrder === 'ASC'
            ? ('ascend' as const)
            : ('descend' as const)
          : undefined,
      onCell: (record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return { colSpan: columns.length };
        return {};
      },
      render: (_: unknown, record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) {
          return (
            <div className="odoo-group-label">
              <strong className="group-label-name">{record.__groupLabel}</strong>
              <span className="group-label-count">{record.__groupCount}</span>
            </div>
          );
        }
        const u = record as UserListItem;
        return (
          <Space>
            <Avatar
              size="small"
              style={{ backgroundColor: u.isSuperAdmin ? '#fadb14' : '#1677ff' }}
            >
              {u.firstName[0]}
              {u.lastName[0]}
            </Avatar>
            {u.firstName} {u.lastName}
            {u.isSuperAdmin && (
              <Tooltip title="Super Admin">
                <CrownOutlined style={{ color: '#fadb14' }} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: t('auth.email'),
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      sortOrder:
        params.sortBy === 'email'
          ? params.sortOrder === 'ASC'
            ? ('ascend' as const)
            : ('descend' as const)
          : undefined,
      onCell: (record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
    },
    {
      title: t('users.roles'),
      key: 'roles',
      responsive: ['md' as const],
      onCell: (record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
      render: (_: unknown, record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return null;
        const u = record as UserListItem;
        const visibleRoles = u.roles.slice(0, 2);
        const restRoles = u.roles.slice(2);
        return (
          <Space size={4}>
            {visibleRoles.map((r) => (
              <OdooTag key={r.id} color={getRoleColor(r.code)}>
                {r.name}
              </OdooTag>
            ))}
            {restRoles.length > 0 && (
              <Popover
                title={t('users.roles')}
                content={
                  <Space direction="vertical" size={4}>
                    {restRoles.map((r) => (
                      <OdooTag key={r.id} color={getRoleColor(r.code)}>
                        {r.name}
                      </OdooTag>
                    ))}
                  </Space>
                }
              >
                <OdooTag color="default" style={{ cursor: 'pointer' }}>
                  +{restRoles.length}
                </OdooTag>
              </Popover>
            )}
          </Space>
        );
      },
    },
    {
      title: t('users.branch'),
      key: 'branch',
      responsive: ['lg' as const],
      onCell: (record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
      render: (_: unknown, record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return null;
        return (record as UserListItem).branch?.name || '-';
      },
    },
    {
      title: t('users.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      sortOrder:
        params.sortBy === 'isActive'
          ? params.sortOrder === 'ASC'
            ? ('ascend' as const)
            : ('descend' as const)
          : undefined,
      onCell: (record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
      render: (_: unknown, record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return null;
        const v = (record as UserListItem).isActive;
        return v ? (
          <OdooTag color="green">{t('common.active')}</OdooTag>
        ) : (
          <OdooTag color="red">{t('common.inactive')}</OdooTag>
        );
      },
    },
    {
      title: t('user.lastLogin'),
      key: 'lastLoginAt',
      responsive: ['xl' as const],
      onCell: (record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return { colSpan: 0 };
        return {};
      },
      render: (_: unknown, record: TableRow<UserListItem>) => {
        if (isGroupRow(record)) return null;
        const u = record as UserListItem;
        return u.lastLoginAt ? (
          <Tooltip title={dayjs(u.lastLoginAt).format('YYYY-MM-DD HH:mm')}>
            {dayjs(u.lastLoginAt).fromNow()}
          </Tooltip>
        ) : (
          '-'
        );
      },
    },
  ];

  const columns = allColumns.filter((col: { key: string }) => visibleColumns.includes(col.key));

  return (
    <Card
      title={t('menu.users')}
      extra={
        <Space>
          {selectedIds.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteSelected}>
              {t('common.deleteSelected', { count: selectedIds.length })}
            </Button>
          )}
          <ColumnsButton
            columns={COLUMN_LABELS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
            onReset={resetColumns}
          />
          <Dropdown
            menu={{
              selectable: true,
              multiple: true,
              selectedKeys: groupBy,
              onClick: ({ key }) => toggleGroup(key),
              items: GROUP_OPTIONS.map((o) => ({ key: o.value, label: o.label })),
            }}
            trigger={['click']}
          >
            <Button icon={<TagsOutlined />}>{t('common.groupBy')}</Button>
          </Dropdown>
          {groupBy.map((field) => (
            <Tag key={field} closable onClose={() => toggleGroup(field)} style={{ marginRight: 0 }}>
              {groupLabels[field]}
            </Tag>
          ))}
          <Input.Search
            placeholder={t('common.search')}
            onSearch={(v) => {
              setSelectedIds([]);
              setParams({ ...params, search: v, page: 1 });
            }}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSelectedIds([]);
              fetchData();
            }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/users/new')}>
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
          const r = record as TableRow<UserListItem> & { id?: string };
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
        rowClassName={(record: TableRow<UserListItem>) =>
          isGroupRow(record) ? 'odoo-group-row' : ''
        }
        onRow={(record: TableRow<UserListItem>) => {
          if (isGroupRow(record)) return {};
          return {
            onClick: () => navigate(`/users/${(record as UserListItem).id}/edit`),
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
              <Button type="primary" onClick={() => navigate('/users/new')}>
                {t('common.create')}
              </Button>
            </Space>
          ),
        }}
      />
    </Card>
  );
}
