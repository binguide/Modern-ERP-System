import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, InputNumber, Select, Switch, Button, App, Form } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxSchema, type TaxInput } from '@modern-erp/shared-schemas';
import { taxesApi, TaxItem } from '@lib/api/endpoints/taxes';
import { FormField } from '@components/FormField';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function TaxesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaxItem | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaxInput>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      code: '',
      name: '',
      rate: 0,
      type: 'percentage',
      isDefault: false,
      isActive: true,
    },
  });

  const grid = useDataGrid<TaxItem>({
    fetchFn: (params) => taxesApi.findAll(params as Record<string, unknown>),
    storageKey: 'taxes-list-columns',
    columnKeys: ['code', 'name', 'rate', 'type', 'isDefault', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ code: '', name: '', rate: 0, type: 'percentage', isDefault: false, isActive: true });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (tax: TaxItem) => {
      setEditing(tax);
      reset({
        code: tax.code,
        name: tax.name,
        rate: tax.rate,
        type: tax.type ?? 'percentage',
        isDefault: tax.isDefault,
        isActive: tax.isActive,
      });
      setModalOpen(true);
    },
    [reset],
  );

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await taxesApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const onSubmit = async (values: TaxInput) => {
    setSaving(true);
    try {
      if (editing) {
        await taxesApi.update(editing.id, values);
        message.success(t('common.updated'));
      } else {
        await taxesApi.create(values);
        message.success(t('common.created'));
      }
      setModalOpen(false);
      grid.refresh();
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!modalOpen) setEditing(null);
  }, [modalOpen]);

  const columns = [
    { title: t('taxes.code'), key: 'code', dataIndex: 'code', sorter: true, width: 100 },
    { title: t('taxes.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    {
      title: t('taxes.rate'),
      key: 'rate',
      dataIndex: 'rate',
      sorter: true,
      width: 100,
      render: (v: number, r: TaxItem) => `${v}${r.type === 'percentage' ? '%' : ''}`,
    },
    {
      title: t('taxes.type'),
      key: 'type',
      dataIndex: 'type',
      width: 120,
      render: (v: string) => t(`taxes.${v}`),
    },
    {
      title: t('taxes.default'),
      key: 'isDefault',
      width: 100,
      render: (v: boolean) => (v ? <OdooTag color="blue">{t('common.yes')}</OdooTag> : '-'),
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      width: 100,
      render: (v: boolean) =>
        v ? (
          <OdooTag color="green">{t('common.active')}</OdooTag>
        ) : (
          <OdooTag color="red">{t('common.inactive')}</OdooTag>
        ),
    },
  ];

  return (
    <div className="erpnext-list">
      <DataGrid<TaxItem>
        {...grid}
        title={t('menu.taxes')}
        icon={<PercentageOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('taxes.code') },
          { key: 'name', label: t('taxes.name') },
          { key: 'rate', label: t('taxes.rate') },
          { key: 'type', label: t('taxes.type') },
          { key: 'isDefault', label: t('taxes.default') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="taxes"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('taxes.edit') : t('taxes.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<TaxInput>
            control={control}
            name="code"
            label={t('taxes.code')}
            errors={errors}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </FormField>
          <FormField<TaxInput>
            control={control}
            name="name"
            label={t('taxes.name')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<TaxInput>
            control={control}
            name="rate"
            label={t('taxes.rate')}
            errors={errors}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </FormField>
          <FormField<TaxInput>
            control={control}
            name="type"
            label={t('taxes.type')}
            errors={errors}
          >
            <Select
              options={[
                { value: 'percentage', label: t('taxes.percentage') },
                { value: 'fixed', label: t('taxes.fixed') },
              ]}
            />
          </FormField>
          <Controller
            name="isDefault"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Form.Item label={t('taxes.default')}>
                <Switch checked={!!value} onChange={onChange} />
              </Form.Item>
            )}
          />
          {editing && (
            <Controller
              name="isActive"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Form.Item label={t('common.status')}>
                  <Switch checked={!!value} onChange={onChange} />
                </Form.Item>
              )}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
