import { useEffect, useState } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Input, Switch, App, Spin, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branchSchema, type BranchInput } from '@modern-erp/shared-schemas';
import { branchesApi } from '@lib/api/endpoints/branches';
import {
  ErpForm,
  ErpFormHeader,
  ErpFormToolbar,
  ErpFormTabs,
  ErpFieldGrid,
  ErpField,
  ErpFormSidebar,
} from '@components/Erp';

export default function BranchFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isEdit = Boolean(id);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: '', code: '', isDefault: false, isActive: true },
  });

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    const loadData = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const branch = await branchesApi.findById(id!);
        reset({
          name: branch.name,
          code: branch.code,
          isDefault: branch.isDefault,
          isActive: branch.isActive,
        });
      } catch {
        message.error(t('errors.loadError'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id, isEdit, reset, message, t]);

  const onSubmit = async (values: BranchInput) => {
    setSaving(true);
    try {
      if (isEdit) {
        await branchesApi.update(id!, values);
        message.success(t('common.updated'));
      } else {
        await branchesApi.create(values);
        message.success(t('common.created'));
      }
      navigate('/branches');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />;

  return (
    <div className="erpnext-form">
      <ErpFormHeader
        title={isEdit ? t('branches.edit') : t('branches.create')}
        isDirty={isDirty}
        onBack={() => navigate('/branches')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <ErpFormToolbar
        status="draft"
        isDirty={isDirty}
        saving={saving}
        onSave={handleSubmit(onSubmit)}
        onDiscard={() => navigate('/branches')}
      />
      <ErpForm sidebar={<ErpFormSidebar />} sidebarOpen={sidebarOpen}>
        <ErpFormTabs
          tabs={[{ key: 'details', label: isEdit ? t('branches.edit') : t('branches.create') }]}
          activeKey="details"
          onChange={() => {}}
        >
          <ErpFieldGrid>
            <ErpField label={t('branches.name')} required>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input {...field} status={errors.name ? 'error' : undefined} />
                    {errors.name && (
                      <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.name.message}</span>
                    )}
                  </div>
                )}
              />
            </ErpField>
            <ErpField label={t('branches.code')} required>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      style={{ textTransform: 'uppercase' }}
                      status={errors.code ? 'error' : undefined}
                    />
                    {errors.code && (
                      <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.code.message}</span>
                    )}
                  </div>
                )}
              />
            </ErpField>
            <ErpField label={t('branches.default')}>
              <Controller
                name="isDefault"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={!!value} onChange={onChange} />
                )}
              />
            </ErpField>
            {isEdit && (
              <ErpField label={t('common.status')}>
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
        </ErpFormTabs>
      </ErpForm>

      <Modal
        title={t('common.unsavedChanges')}
        open={blocker.state === 'blocked'}
        onOk={blocker.proceed}
        onCancel={blocker.reset}
        okText={t('common.leave')}
        cancelText={t('common.stay')}
      >
        {t('common.unsavedChangesMessage')}
      </Modal>
    </div>
  );
}
