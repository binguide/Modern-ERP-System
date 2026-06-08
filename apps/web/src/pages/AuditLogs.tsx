import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Tag, Space, App, Typography, Button, Select } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { auditApi, AuditLogEntry } from '@lib/api/endpoints/audit';
import dayjs from 'dayjs';

const { Text } = Typography;

const ACTION_COLORS: Record<string, string> = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  login: 'purple',
  logout: 'default',
};

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [resource, setResource] = useState<string | undefined>(undefined);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await auditApi.findAll({ page, limit: 50, resource });
      setLogs(result.data);
      setTotal(result.total);
    } catch {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [page, resource, message, t]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      title: t('auditLogs.date'),
      key: 'createdAt',
      width: 180,
      render: (_: unknown, record: AuditLogEntry) =>
        dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('auditLogs.action'),
      key: 'action',
      width: 100,
      render: (_: unknown, record: AuditLogEntry) => (
        <Tag
          color={ACTION_COLORS[record.action] || 'default'}
          style={{ textTransform: 'capitalize' }}
        >
          {record.action}
        </Tag>
      ),
    },
    {
      title: t('auditLogs.resource'),
      key: 'resource',
      width: 120,
      render: (_: unknown, record: AuditLogEntry) => (
        <Text strong style={{ textTransform: 'capitalize' }}>
          {record.resource}
        </Text>
      ),
    },
    {
      title: t('auditLogs.resourceId'),
      key: 'resourceId',
      width: 140,
      dataIndex: 'resourceId',
      render: (v: string | null) => (v ? <Text code>{v.substring(0, 8)}...</Text> : '-'),
    },
    {
      title: t('auditLogs.userId'),
      key: 'userId',
      width: 140,
      dataIndex: 'userId',
      render: (v: string | null) => (v ? <Text code>{v.substring(0, 8)}...</Text> : '-'),
    },
    {
      title: t('auditLogs.ipAddress'),
      key: 'ipAddress',
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
          return <Text type="secondary">{changedFields.join(', ') || '-'}</Text>;
        }
        return <Text type="secondary">-</Text>;
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('menu.auditLogs')}
        </Typography.Title>
        <Space>
          <Select
            allowClear
            placeholder={t('auditLogs.filterResource')}
            style={{ width: 160 }}
            value={resource}
            onChange={(v) => {
              setResource(v);
              setPage(1);
            }}
          >
            <Select.Option value="User">User</Select.Option>
            <Select.Option value="Role">Role</Select.Option>
            <Select.Option value="Branch">Branch</Select.Option>
            <Select.Option value="Company">Company</Select.Option>
          </Select>
          <Button icon={<SyncOutlined />} onClick={() => fetchLogs()} />
        </Space>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 50,
            total,
            onChange: setPage,
            showTotal: (total) => t('common.total', { count: total }),
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
    </div>
  );
}
