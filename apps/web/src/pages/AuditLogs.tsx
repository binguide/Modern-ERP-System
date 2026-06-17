import { Select } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { auditApi, AuditLogEntry } from '@lib/api/endpoints/audit';
import dayjs from 'dayjs';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const ACTION_COLORS: Record<string, string> = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  login: 'purple',
  logout: 'default',
};

export default function AuditLogsPage() {
  const { t } = useTranslation();

  const grid = useDataGrid<AuditLogEntry>({
    fetchFn: (params) => auditApi.findAll(params as Record<string, unknown>),
    storageKey: 'audit-logs-columns',
    columnKeys: ['createdAt', 'action', 'resource', 'resourceId', 'userId', 'ipAddress', 'details'],
    defaultParams: { limit: 50 },
  });

  const columns = [
    {
      title: t('auditLogs.date'),
      key: 'createdAt',
      sorter: true,
      width: 180,
      render: (_: unknown, record: AuditLogEntry) =>
        dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('auditLogs.action'),
      key: 'action',
      sorter: true,
      width: 100,
      render: (_: unknown, record: AuditLogEntry) => (
        <span
          style={{
            color: ACTION_COLORS[record.action] ? undefined : 'rgba(0,0,0,0.65)',
            fontWeight: 500,
            textTransform: 'capitalize',
          }}
        >
          {record.action}
        </span>
      ),
    },
    {
      title: t('auditLogs.resource'),
      key: 'resource',
      sorter: true,
      width: 120,
      render: (_: unknown, record: AuditLogEntry) => (
        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{record.resource}</span>
      ),
    },
    {
      title: t('auditLogs.resourceId'),
      key: 'resourceId',
      width: 140,
      dataIndex: 'resourceId',
      render: (v: string | null) => (v ? `${v.substring(0, 8)}...` : '-'),
    },
    {
      title: t('auditLogs.userId'),
      key: 'userId',
      width: 140,
      dataIndex: 'userId',
      render: (v: string | null) => (v ? `${v.substring(0, 8)}...` : '-'),
    },
    {
      title: t('auditLogs.ipAddress'),
      key: 'ipAddress',
      sorter: true,
      width: 130,
      dataIndex: 'ipAddress',
      render: (v: string | null) => v || '-',
    },
    {
      title: t('auditLogs.details'),
      key: 'details',
      render: (_: unknown, record: AuditLogEntry) => {
        if (record.action === 'update' && record.oldValues && record.newValues) {
          const changedFields = Object.keys(record.newValues).filter(
            (k) => JSON.stringify(record.oldValues![k]) !== JSON.stringify(record.newValues![k]),
          );
          return <span style={{ opacity: 0.65 }}>{changedFields.join(', ') || '-'}</span>;
        }
        return <span style={{ opacity: 0.65 }}>-</span>;
      },
    },
  ];

  const handleResourceFilter = (value: string | undefined) => {
    grid.setSelectedIds([]);
    grid.setParams((prev) => ({ ...prev, resource: value, page: 1 }));
  };

  return (
    <div className="erpnext-list">
      <DataGrid<AuditLogEntry>
        {...grid}
        title={t('menu.auditLogs')}
        icon={<HistoryOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'createdAt', label: t('auditLogs.date') },
          { key: 'action', label: t('auditLogs.action') },
          { key: 'resource', label: t('auditLogs.resource') },
          { key: 'resourceId', label: t('auditLogs.resourceId') },
          { key: 'userId', label: t('auditLogs.userId') },
          { key: 'ipAddress', label: t('auditLogs.ipAddress') },
          { key: 'details', label: t('auditLogs.details') },
        ]}
        basePath="audit-logs"
        search={false}
        create={false}
        deleteSelected={false}
        rowClick={false}
        emptyCreate={false}
        toolbarExtra={
          <Select
            allowClear
            placeholder={t('auditLogs.filterResource')}
            style={{ width: 160 }}
            value={grid.params.resource as string | undefined}
            onChange={handleResourceFilter}
          >
            <Select.Option value="User">User</Select.Option>
            <Select.Option value="Role">Role</Select.Option>
            <Select.Option value="Branch">Branch</Select.Option>
            <Select.Option value="Company">Company</Select.Option>
          </Select>
        }
      />
    </div>
  );
}
