import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Select, Switch, App, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { usersApi, type CreateUserPayload, type UpdateUserPayload } from '@lib/api/endpoints/users';
import { branchesApi, type BranchItem } from '@lib/api/endpoints/branches';
import { rolesApi, type RoleItem } from '@lib/api/endpoints/roles';
import {
  ErpForm,
  ErpFormHeader,
  ErpFormToolbar,
  ErpFormTabs,
  ErpFieldGrid,
  ErpField,
  ErpFormSidebar,
} from '@components/Erp';

interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branchId?: string;
  roleIds: string[];
  password?: string;
  isActive?: boolean;
}

export default function UserFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const isEdit = Boolean(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      branchId: undefined,
      roleIds: [],
      password: '',
      isActive: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [branchesData, rolesData] = await Promise.all([
          branchesApi.findAll({ page: 1, limit: 100 }),
          rolesApi.findAll({ page: 1, limit: 100 }),
        ]);
        setBranches(branchesData.data);
        setRoles(rolesData.data);

        if (id) {
          const user = await usersApi.findById(id);
          reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            branchId: user.branchId || undefined,
            roleIds: user.roles.map((r) => r.id),
            isActive: user.isActive,
          });
        }
      } catch {
        message.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id, reset, message, t]);

  const [sectionTab, setSectionTab] = useState('personal');

  const onSubmit = async (values: UserFormValues) => {
    if (!values.firstName || !values.lastName || !values.email) {
      message.error(t('validation.required', { field: '' }));
      return;
    }
    if (!isEdit && !values.password) {
      message.error(t('validation.required', { field: t('auth.password') }));
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const payload: UpdateUserPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          branchId: values.branchId || undefined,
          roleIds: values.roleIds.length > 0 ? values.roleIds : undefined,
          isActive: values.isActive,
        };
        await usersApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        const payload: CreateUserPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password!,
          phone: values.phone || undefined,
          branchId: values.branchId || undefined,
          roleIds: values.roleIds.length > 0 ? values.roleIds : undefined,
        };
        await usersApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/users');
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />;

  return (
    <div className="erpnext-form">
      <ErpFormHeader
        title={isEdit ? t('user.editUser') : t('user.createUser')}
        onBack={() => navigate('/users')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <ErpFormToolbar
        status="draft"
        saving={saving}
        onSave={handleSubmit(onSubmit)}
        onDiscard={() => navigate('/users')}
      />
      <ErpForm sidebar={<ErpFormSidebar />} sidebarOpen={sidebarOpen}>
        <ErpFormTabs
          tabs={[
            { key: 'personal', label: t('user.personalInfo') },
            { key: 'account', label: t('user.accountInfo') },
            { key: 'security', label: t('auth.password') },
          ]}
          activeKey={sectionTab}
          onChange={setSectionTab}
        >
          {sectionTab === 'personal' && (
            <ErpFieldGrid>
              <ErpField label={t('user.firstName')} required>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input {...field} status={errors.firstName ? 'error' : undefined} />
                      {errors.firstName && (
                        <span style={{ color: '#ef4444', fontSize: 11 }}>
                          {errors.firstName.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </ErpField>
              <ErpField label={t('user.lastName')} required>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input {...field} status={errors.lastName ? 'error' : undefined} />
                      {errors.lastName && (
                        <span style={{ color: '#ef4444', fontSize: 11 }}>
                          {errors.lastName.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </ErpField>
              <ErpField label={t('auth.email')} required>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input {...field} type="email" status={errors.email ? 'error' : undefined} />
                      {errors.email && (
                        <span style={{ color: '#ef4444', fontSize: 11 }}>
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </ErpField>
              <ErpField label={t('user.phone')}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </ErpField>
            </ErpFieldGrid>
          )}
          {sectionTab === 'account' && (
            <ErpFieldGrid>
              <ErpField label={t('users.branch')}>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      placeholder={t('users.branch')}
                      value={field.value || undefined}
                      onChange={(val) => field.onChange(val ?? undefined)}
                      options={branches.map((b) => ({ value: b.id, label: b.name }))}
                    />
                  )}
                />
              </ErpField>
              <ErpField label={t('users.roles')}>
                <Controller
                  name="roleIds"
                  control={control}
                  render={({ field }) => (
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder={t('users.roles')}
                      {...field}
                      value={field.value || []}
                      options={roles.map((r) => ({ value: r.id, label: r.name }))}
                    />
                  )}
                />
              </ErpField>
              {isEdit && (
                <ErpField label={t('user.isActive')}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch checked={!!value} onChange={onChange} />
                    )}
                  />
                </ErpField>
              )}
            </ErpFieldGrid>
          )}
          {sectionTab === 'security' && !isEdit && (
            <ErpFieldGrid>
              <ErpField label={t('auth.password')} required>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input.Password {...field} status={errors.password ? 'error' : undefined} />
                      {errors.password && (
                        <span style={{ color: '#ef4444', fontSize: 11 }}>
                          {errors.password.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </ErpField>
            </ErpFieldGrid>
          )}
          {sectionTab === 'security' && isEdit && (
            <div style={{ padding: 24, textAlign: 'center', color: '#8d99a6' }}>
              {t('common.noData')}
            </div>
          )}
        </ErpFormTabs>
      </ErpForm>
    </div>
  );
}
