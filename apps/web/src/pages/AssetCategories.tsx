import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, InputNumber, Switch, Button, App, Form } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { assetCategoriesApi, AssetCategory } from '@lib/api/endpoints/fixed-assets';
import { FormField } from '@components/FormField';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

interface AssetCategoryFormValues {
  code: string;
  name: string;
  description: string;
  depreciationMethod: string;
  usefulLifeYears: number;
  salvageValuePct: number;
  isActive: boolean;
}

export default function AssetCategoriesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AssetCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetCategoryFormValues>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      depreciationMethod: '',
      usefulLifeYears: 0,
      salvageValuePct: 0,
      isActive: true,
    },
  });

  const grid = useDataGrid<AssetCategory>({
    fetchFn: (params) => assetCategoriesApi.getAll(params as Record<string, unknown>),
    storageKey: 'asset-categories-list-columns',
    columnKeys: [
      'code',
      'name',
      'description',
      'depreciationMethod',
      'usefulLifeYears',
      'salvageValuePct',
      'isActive',
    ],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({
      code: '',
      name: '',
      description: '',
      depreciationMethod: '',
      usefulLifeYears: 0,
      salvageValuePct: 0,
      isActive: true,
    });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (cat: AssetCategory) => {
      setEditing(cat);
      reset({
        code: cat.code,
        name: cat.name,
        description: cat.description ?? '',
        depreciationMethod: cat.depreciationMethod ?? '',
        usefulLifeYears: cat.usefulLifeYears ?? 0,
        salvageValuePct: cat.salvageValuePct ?? 0,
        isActive: cat.isActive,
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
            await assetCategoriesApi.delete(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const onSubmit = async (values: AssetCategoryFormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await assetCategoriesApi.update(editing.id, values);
        message.success(t('common.updated'));
      } else {
        await assetCategoriesApi.create(values);
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
    { title: t('assetCategories.code'), key: 'code', dataIndex: 'code', sorter: true, width: 100 },
    { title: t('assetCategories.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    {
      title: t('assetCategories.description'),
      key: 'description',
      dataIndex: 'description',
      width: 200,
    },
    {
      title: t('assetCategories.depreciationMethod'),
      key: 'depreciationMethod',
      dataIndex: 'depreciationMethod',
      width: 140,
    },
    {
      title: t('assetCategories.usefulLifeYears'),
      key: 'usefulLifeYears',
      dataIndex: 'usefulLifeYears',
      sorter: true,
      width: 120,
      render: (v: number) => v ?? '-',
    },
    {
      title: t('assetCategories.salvageValuePct'),
      key: 'salvageValuePct',
      dataIndex: 'salvageValuePct',
      sorter: true,
      width: 120,
      render: (v: number) => (v != null ? `${v}%` : '-'),
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
      <DataGrid<AssetCategory>
        {...grid}
        title={t('menu.assetCategories')}
        icon={<AppstoreOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('assetCategories.code') },
          { key: 'name', label: t('assetCategories.name') },
          { key: 'description', label: t('assetCategories.description') },
          { key: 'depreciationMethod', label: t('assetCategories.depreciationMethod') },
          { key: 'usefulLifeYears', label: t('assetCategories.usefulLifeYears') },
          { key: 'salvageValuePct', label: t('assetCategories.salvageValuePct') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="asset-categories"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('assetCategories.edit') : t('assetCategories.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<AssetCategoryFormValues>
            control={control}
            name="code"
            label={t('assetCategories.code')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<AssetCategoryFormValues>
            control={control}
            name="name"
            label={t('assetCategories.name')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<AssetCategoryFormValues>
            control={control}
            name="description"
            label={t('assetCategories.description')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<AssetCategoryFormValues>
            control={control}
            name="depreciationMethod"
            label={t('assetCategories.depreciationMethod')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<AssetCategoryFormValues>
            control={control}
            name="usefulLifeYears"
            label={t('assetCategories.usefulLifeYears')}
            errors={errors}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </FormField>
          <FormField<AssetCategoryFormValues>
            control={control}
            name="salvageValuePct"
            label={t('assetCategories.salvageValuePct')}
            errors={errors}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </FormField>
          <Controller
            name="isActive"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Form.Item label={t('common.status')}>
                <Switch checked={!!value} onChange={onChange} />
              </Form.Item>
            )}
          />
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
