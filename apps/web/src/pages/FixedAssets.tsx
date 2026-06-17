import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, InputNumber, Select, Button, App, Form } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  fixedAssetsApi,
  assetCategoriesApi,
  FixedAsset,
  AssetCategory,
} from '@lib/api/endpoints/fixed-assets';
import { FormField } from '@components/FormField';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';
import dayjs from 'dayjs';

interface FixedAssetFormValues {
  assetCode: string;
  name: string;
  categoryId: string;
  purchaseDate: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  location: string;
  notes: string;
}

export default function FixedAssetsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FixedAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<AssetCategory[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FixedAssetFormValues>({
    defaultValues: {
      assetCode: '',
      name: '',
      categoryId: '',
      purchaseDate: '',
      purchaseCost: 0,
      salvageValue: 0,
      usefulLifeYears: 5,
      location: '',
      notes: '',
    },
  });

  useEffect(() => {
    assetCategoriesApi.getAll({ limit: 1000 }).then((res) => setCategories(res.data));
  }, []);

  const grid = useDataGrid<FixedAsset>({
    fetchFn: (params) => fixedAssetsApi.getAll(params as Record<string, unknown>),
    storageKey: 'fixed-assets-list-columns',
    columnKeys: [
      'assetCode',
      'name',
      'category',
      'purchaseDate',
      'purchaseCost',
      'salvageValue',
      'usefulLifeYears',
      'accumulatedDepreciation',
      'bookValue',
      'status',
      'location',
    ],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({
      assetCode: '',
      name: '',
      categoryId: '',
      purchaseDate: dayjs().format('YYYY-MM-DD'),
      purchaseCost: 0,
      salvageValue: 0,
      usefulLifeYears: 5,
      location: '',
      notes: '',
    });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (asset: FixedAsset) => {
      setEditing(asset);
      reset({
        assetCode: asset.assetCode,
        name: asset.name,
        categoryId: asset.categoryId,
        purchaseDate: dayjs(asset.purchaseDate).format('YYYY-MM-DD'),
        purchaseCost: asset.purchaseCost,
        salvageValue: asset.salvageValue,
        usefulLifeYears: asset.usefulLifeYears,
        location: asset.location ?? '',
        notes: asset.notes ?? '',
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
            await fixedAssetsApi.delete(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const handleDispose = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: t('fixedAssets.dispose'),
        onOk: async () => {
          await fixedAssetsApi.dispose(id);
          message.success(t('common.updated'));
          setModalOpen(false);
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const onSubmit = async (values: FixedAssetFormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await fixedAssetsApi.update(editing.id, values as unknown as Record<string, unknown>);
        message.success(t('common.updated'));
      } else {
        await fixedAssetsApi.create(values as unknown as Record<string, unknown>);
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

  const statusRender = (v: string) => {
    if (v === 'active') return <OdooTag color="green">{t('fixedAssets.status_active')}</OdooTag>;
    if (v === 'disposed') return <OdooTag color="red">{t('fixedAssets.status_disposed')}</OdooTag>;
    return <OdooTag color="default">{t('fixedAssets.status_draft')}</OdooTag>;
  };

  const columns = [
    {
      title: t('fixedAssets.assetCode'),
      key: 'assetCode',
      dataIndex: 'assetCode',
      sorter: true,
      width: 120,
    },
    { title: t('fixedAssets.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    {
      title: t('fixedAssets.category'),
      key: 'category',
      width: 150,
      render: (_: unknown, r: FixedAsset) => r.category?.name ?? '-',
    },
    {
      title: t('fixedAssets.purchaseDate'),
      key: 'purchaseDate',
      dataIndex: 'purchaseDate',
      sorter: true,
      width: 130,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: t('fixedAssets.purchaseCost'),
      key: 'purchaseCost',
      dataIndex: 'purchaseCost',
      sorter: true,
      width: 130,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: t('fixedAssets.salvageValue'),
      key: 'salvageValue',
      dataIndex: 'salvageValue',
      sorter: true,
      width: 130,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: t('fixedAssets.usefulLifeYears'),
      key: 'usefulLifeYears',
      dataIndex: 'usefulLifeYears',
      sorter: true,
      width: 100,
      render: (v: number) => v ?? '-',
    },
    {
      title: t('fixedAssets.accumulatedDepreciation'),
      key: 'accumulatedDepreciation',
      dataIndex: 'accumulatedDepreciation',
      sorter: true,
      width: 150,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: t('fixedAssets.bookValue'),
      key: 'bookValue',
      dataIndex: 'bookValue',
      sorter: true,
      width: 130,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: t('fixedAssets.status'),
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      width: 100,
      render: statusRender,
    },
    { title: t('fixedAssets.location'), key: 'location', dataIndex: 'location', width: 150 },
  ];

  return (
    <div className="erpnext-list">
      <DataGrid<FixedAsset>
        {...grid}
        title={t('menu.fixedAssets')}
        icon={<ToolOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'assetCode', label: t('fixedAssets.assetCode') },
          { key: 'name', label: t('fixedAssets.name') },
          { key: 'category', label: t('fixedAssets.category') },
          { key: 'purchaseDate', label: t('fixedAssets.purchaseDate') },
          { key: 'purchaseCost', label: t('fixedAssets.purchaseCost') },
          { key: 'salvageValue', label: t('fixedAssets.salvageValue') },
          { key: 'usefulLifeYears', label: t('fixedAssets.usefulLifeYears') },
          { key: 'accumulatedDepreciation', label: t('fixedAssets.accumulatedDepreciation') },
          { key: 'bookValue', label: t('fixedAssets.bookValue') },
          { key: 'status', label: t('fixedAssets.status') },
          { key: 'location', label: t('fixedAssets.location') },
        ]}
        basePath="fixed-assets"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('fixedAssets.edit') : t('fixedAssets.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<FixedAssetFormValues>
            control={control}
            name="assetCode"
            label={t('fixedAssets.assetCode')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<FixedAssetFormValues>
            control={control}
            name="name"
            label={t('fixedAssets.name')}
            errors={errors}
          >
            <Input />
          </FormField>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('fixedAssets.category')}>
                <Select
                  {...field}
                  style={{ width: '100%' }}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
            )}
          />
          <FormField<FixedAssetFormValues>
            control={control}
            name="purchaseDate"
            label={t('fixedAssets.purchaseDate')}
            errors={errors}
          >
            <Input type="date" />
          </FormField>
          <FormField<FixedAssetFormValues>
            control={control}
            name="purchaseCost"
            label={t('fixedAssets.purchaseCost')}
            errors={errors}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </FormField>
          <FormField<FixedAssetFormValues>
            control={control}
            name="salvageValue"
            label={t('fixedAssets.salvageValue')}
            errors={errors}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </FormField>
          <FormField<FixedAssetFormValues>
            control={control}
            name="usefulLifeYears"
            label={t('fixedAssets.usefulLifeYears')}
            errors={errors}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </FormField>
          <FormField<FixedAssetFormValues>
            control={control}
            name="location"
            label={t('fixedAssets.location')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<FixedAssetFormValues>
            control={control}
            name="notes"
            label={t('fixedAssets.notes')}
            errors={errors}
          >
            <Input />
          </FormField>
          {editing && (
            <Form.Item label={t('fixedAssets.status')}>{statusRender(editing.status)}</Form.Item>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            {editing && editing.status !== 'disposed' && (
              <Button danger onClick={() => handleDispose(editing.id)}>
                {t('fixedAssets.dispose')}
              </Button>
            )}
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
