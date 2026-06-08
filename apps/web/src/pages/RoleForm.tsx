import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  App,
  Spin,
  Table,
  Checkbox,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
} from 'antd';
import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  rolesApi,
  PermissionInfo,
  CreateRolePayload,
  UpdateRolePayload,
} from '@lib/api/endpoints/roles';

const { TextArea } = Input;
const { Title } = Typography;

const RESOURCES = ['users', 'roles', 'companies', 'branches', 'currencies', 'audit', 'settings'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;
const SCOPES = ['company', 'branch', 'own'];

interface PermissionRow {
  resource: string;
  [key: string]: string | boolean;
}

const RESOURCE_LABELS: Record<string, string> = {
  users: 'Users',
  roles: 'Roles',
  companies: 'Companies',
  branches: 'Branches',
  currencies: 'Currencies',
  audit: 'Audit Logs',
  settings: 'Settings',
};

export default function RoleFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);
  const isEdit = Boolean(id);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const role = await rolesApi.findById(id);
        form.setFieldsValue({
          code: role.code,
          name: role.name,
          description: role.description || '',
        });
        setPermissions(role.permissions);
      } catch {
        message.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id, form, message, t]);

  const isPermissionChecked = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const togglePermission = (resource: string, action: string) => {
    setPermissions((prev) => {
      const exists = prev.find((p) => p.resource === resource && p.action === action);
      if (exists) {
        return prev.filter((p) => !(p.resource === resource && p.action === action));
      }
      return [...prev, { resource, action, scope: 'company' }];
    });
  };

  const getScope = (resource: string): string => {
    const p = permissions.find((p) => p.resource === resource);
    return p?.scope || 'company';
  };

  const setScope = (resource: string, scope: string) => {
    setPermissions((prev) => {
      const existing = prev.filter((p) => p.resource === resource);
      if (existing.length === 0) return prev;
      return [
        ...prev.filter((p) => p.resource !== resource),
        ...existing.map((p) => ({ ...p, scope })),
      ];
    });
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const payloadPerms = permissions.length > 0 ? permissions : undefined;
      if (isEdit) {
        const payload: UpdateRolePayload = {
          code: values.code as string,
          name: values.name as string,
          description: (values.description as string) || undefined,
          permissions: payloadPerms,
        };
        await rolesApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        const payload: CreateRolePayload = {
          code: values.code as string,
          name: values.name as string,
          description: (values.description as string) || undefined,
          permissions: payloadPerms,
        };
        await rolesApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/roles');
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const permissionColumns = [
    {
      title: t('role.permissions'),
      key: 'resource',
      width: 140,
      render: (_: unknown, record: PermissionRow) => (
        <Typography.Text strong style={{ fontSize: 13 }}>
          {RESOURCE_LABELS[record.resource] || record.resource}
        </Typography.Text>
      ),
    },
    ...ACTIONS.map((action) => ({
      title: (
        <Tag color="default" style={{ fontSize: 11, margin: 0, textTransform: 'capitalize' }}>
          {action}
        </Tag>
      ),
      key: action,
      width: 72,
      align: 'center' as const,
      render: (_: unknown, record: PermissionRow) => (
        <Checkbox
          checked={isPermissionChecked(record.resource, action)}
          onChange={() => togglePermission(record.resource, action)}
        />
      ),
    })),
    {
      title: t('roles.type'),
      key: 'scope',
      width: 130,
      render: (_: unknown, record: PermissionRow) => {
        const hasAny = ACTIONS.some((a) => isPermissionChecked(record.resource, a));
        if (!hasAny) return null;
        return (
          <Select
            size="small"
            value={getScope(record.resource)}
            onChange={(v) => setScope(record.resource, v)}
            style={{ width: 100 }}
          >
            {SCOPES.map((s) => (
              <Select.Option key={s} value={s}>
                <span style={{ textTransform: 'capitalize' }}>{s}</span>
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
  ];

  const permissionData: PermissionRow[] = RESOURCES.map((resource) => ({ resource }));

  if (loading) return <Spin style={{ display: 'block', margin: '64px auto' }} />;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 600 }}>
            {isEdit ? t('role.editRole') : t('role.createRole')}
          </span>
        }
        style={{ borderRadius: 12 }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            <InfoCircleOutlined style={{ marginInlineEnd: 8 }} />
            {t('role.basicInfo')}
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label={t('role.code')}
                rules={[
                  { required: true, message: t('validation.required', { field: t('role.code') }) },
                ]}
              >
                <Input style={{ textTransform: 'uppercase' }} placeholder="ADMIN" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t('role.name')}
                rules={[
                  { required: true, message: t('validation.required', { field: t('role.name') }) },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label={t('role.description')}>
            <TextArea rows={3} />
          </Form.Item>

          <Divider style={{ margin: '16px 0 20px' }} />
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            <LockOutlined style={{ marginInlineEnd: 8 }} />
            {t('role.permissions')}
          </Title>
          <Form.Item label={null}>
            <Table
              dataSource={permissionData}
              columns={permissionColumns}
              rowKey="resource"
              pagination={false}
              bordered
              size="middle"
            />
          </Form.Item>

          <Divider style={{ margin: '20px 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => navigate('/roles')}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
