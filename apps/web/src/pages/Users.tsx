import { Avatar, Space, Tooltip, Popover, App, Modal } from 'antd';
import { CrownOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { usersApi, UserListItem } from '@lib/api/endpoints/users';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getRoleColor } from '@lib/tag-colors';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';
import type { GroupConfig } from '@lib/table-utils';

dayjs.extend(relativeTime);

export default function UsersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const grid = useDataGrid<UserListItem>({
    fetchFn: (params) => usersApi.findAll(params as Record<string, unknown>),
    storageKey: 'users-list-columns',
    columnKeys: ['firstName', 'email', 'roles', 'branch', 'isActive', 'lastLoginAt'],
    groupOptions: [
      { value: 'branch', label: t('users.branch') },
      { value: 'isActive', label: t('users.status') },
    ],
    getGroupConfig: (field) => {
      if (field === 'branch') {
        return {
          getGroupValue: (item) => item.branch?.name || t('common.noData'),
          getGroupLabel: (v) => v,
        } as GroupConfig<UserListItem>;
      }
      return {
        getGroupValue: (item) => (item.isActive ? 'active' : 'inactive'),
        getGroupLabel: (v) => (v === 'active' ? t('common.active') : t('common.inactive')),
      } as GroupConfig<UserListItem>;
    },
  });

  const handleDeleteSelected = async (ids: string[]) => {
    Modal.confirm({
      title: t('common.confirmDelete'),
      content: t('users.confirmDeleteSelected', { count: ids.length }),
      onOk: async () => {
        for (const id of ids) {
          await usersApi.remove(id);
        }
        message.success(t('common.deleted'));
        grid.clearSelection();
        grid.refresh();
      },
    });
  };

  const columns = [
    {
      title: t('users.name'),
      key: 'firstName',
      sorter: true,
      render: (_: unknown, record: UserListItem) => (
        <Space>
          <Avatar
            size="small"
            style={{ backgroundColor: record.isSuperAdmin ? '#fadb14' : '#1677ff' }}
          >
            {record.firstName[0]}
            {record.lastName[0]}
          </Avatar>
          {record.firstName} {record.lastName}
          {record.isSuperAdmin && (
            <Tooltip title="Super Admin">
              <CrownOutlined style={{ color: '#fadb14' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: t('auth.email'),
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: t('users.roles'),
      key: 'roles',
      responsive: ['md' as const],
      render: (_: unknown, record: UserListItem) => {
        const visibleRoles = record.roles.slice(0, 2);
        const restRoles = record.roles.slice(2);
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
      render: (_: unknown, record: UserListItem) => record.branch?.name || '-',
    },
    {
      title: t('users.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      render: (v: boolean) =>
        v ? (
          <OdooTag color="green">{t('common.active')}</OdooTag>
        ) : (
          <OdooTag color="red">{t('common.inactive')}</OdooTag>
        ),
    },
    {
      title: t('user.lastLogin'),
      key: 'lastLoginAt',
      responsive: ['xl' as const],
      render: (_: unknown, record: UserListItem) =>
        record.lastLoginAt ? (
          <Tooltip title={dayjs(record.lastLoginAt).format('YYYY-MM-DD HH:mm')}>
            {dayjs(record.lastLoginAt).fromNow()}
          </Tooltip>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <DataGrid<UserListItem>
      {...grid}
      title={t('menu.users')}
      icon={<UserOutlined />}
      columns={columns}
      columnLabels={[
        { key: 'firstName', label: t('users.name') },
        { key: 'email', label: t('auth.email') },
        { key: 'roles', label: t('users.roles') },
        { key: 'branch', label: t('users.branch') },
        { key: 'isActive', label: t('users.status') },
        { key: 'lastLoginAt', label: t('user.lastLogin') },
      ]}
      basePath="users"
      groupOptions={[
        { value: 'branch', label: t('users.branch') },
        { value: 'isActive', label: t('users.status') },
      ]}
      onDeleteSelected={handleDeleteSelected}
    />
  );
}
