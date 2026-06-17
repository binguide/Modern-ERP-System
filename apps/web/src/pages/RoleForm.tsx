import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, App, Spin, Table, Checkbox, Select, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { rolesApi, type PermissionInfo } from '@lib/api/endpoints/roles';
import {
  ErpForm,
  ErpFormHeader,
  ErpFormToolbar,
  ErpFormTabs,
  ErpFieldGrid,
  ErpField,
  ErpFormSidebar,
} from '@components/Erp';

const { TextArea } = Input;

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

interface RoleFormValues {
  code: string;
  name: string;
  description: string;
}

export default function RoleFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);
  const isEdit = Boolean(id);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormValues>({
    defaultValues: { code: '', name: '', description: '' },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const role = await rolesApi.findById(id);
        reset({ code: role.code, name: role.name, description: role.description || '' });
        setPermissions(role.permissions);
      } catch {
        message.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id, reset, message, t]);

  const [sectionTab, setSectionTab] = useState('details');

  const isPermissionChecked = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const togglePermission = (resource: string, action: string) => {
    setPermissions((prev) => {
      const exists = prev.find((p) => p.resource === resource && p.action === action);
      if (exists) return prev.filter((p) => !(p.resource === resource && p.action === action));
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

  const onSubmit = async (values: RoleFormValues) => {
    if (!values.code || !values.name) {
      message.error(t('validation.required', { field: '' }));
      return;
    }
    setSaving(true);
    try {
      const payloadPerms = permissions.length > 0 ? permissions : undefined;
      if (isEdit) {
        await rolesApi.update(id!, {
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          permissions: payloadPerms,
        });
        message.success(t('common.updated'));
      } else {
        await rolesApi.create({
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          permissions: payloadPerms,
        });
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
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {RESOURCE_LABELS[record.resource] || record.resource}
        </span>
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
            options={SCOPES.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
          />
        );
      },
    },
  ];

  const permissionData: PermissionRow[] = RESOURCES.map((resource) => ({ resource }));

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />;

  return (
    <div className="erpnext-form">
      <ErpFormHeader
        title={isEdit ? t('role.editRole') : t('role.createRole')}
        onBack={() => navigate('/roles')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <ErpFormToolbar
        status="draft"
        saving={saving}
        onSave={handleSubmit(onSubmit)}
        onDiscard={() => navigate('/roles')}
      />
      <ErpForm sidebar={<ErpFormSidebar />} sidebarOpen={sidebarOpen}>
        <ErpFormTabs
          tabs={[
            { key: 'details', label: t('role.basicInfo') },
            { key: 'permissions', label: t('role.permissions') },
          ]}
          activeKey={sectionTab}
          onChange={setSectionTab}
        >
          {sectionTab === 'details' && (
            <ErpFieldGrid>
              <ErpField label={t('role.code')} required>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input
                        {...field}
                        style={{ textTransform: 'uppercase' }}
                        placeholder="ADMIN"
                        status={errors.code ? 'error' : undefined}
                      />
                      {errors.code && (
                        <span style={{ color: '#ef4444', fontSize: 11 }}>
                          {errors.code.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </ErpField>
              <ErpField label={t('role.name')} required>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input {...field} status={errors.name ? 'error' : undefined} />
                      {errors.name && (
                        <span style={{ color: '#ef4444', fontSize: 11 }}>
                          {errors.name.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </ErpField>
              <ErpField label={t('role.description')} fullWidth>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <TextArea {...field} rows={3} />}
                />
              </ErpField>
            </ErpFieldGrid>
          )}
          {sectionTab === 'permissions' && (
            <Table
              dataSource={permissionData}
              columns={permissionColumns}
              rowKey="resource"
              pagination={false}
              bordered
              size="small"
              style={{ margin: 16 }}
            />
          )}
        </ErpFormTabs>
      </ErpForm>
    </div>
  );
}
