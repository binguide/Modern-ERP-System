import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, Switch, Button, App, Form } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { warehouseSchema, type WarehouseInput } from '@modern-erp/shared-schemas';
import { warehousesApi, WarehouseItem } from '@lib/api/endpoints/warehouses';
import { FormField } from '@components/FormField';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function WarehousesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseItem | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WarehouseInput>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { code: '', name: '', address: '', isActive: true },
  });

  const grid = useDataGrid<WarehouseItem>({
    fetchFn: (params) => warehousesApi.findAll(params as Record<string, unknown>),
    storageKey: 'warehouses-list-columns',
    columnKeys: ['code', 'name', 'address', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ code: '', name: '', address: '', isActive: true });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (wh: WarehouseItem) => {
      setEditing(wh);
      reset({ code: wh.code, name: wh.name, address: wh.address ?? '', isActive: wh.isActive });
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
            await warehousesApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const onSubmit = async (values: WarehouseInput) => {
    setSaving(true);
    try {
      if (editing) {
        await warehousesApi.update(editing.id, values);
        message.success(t('common.updated'));
      } else {
        await warehousesApi.create(values);
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
    { title: t('warehouses.code'), key: 'code', dataIndex: 'code', sorter: true, width: 100 },
    { title: t('warehouses.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    { title: t('warehouses.address'), key: 'address', dataIndex: 'address', width: 300 },
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
      <DataGrid<WarehouseItem>
        {...grid}
        title={t('menu.warehouses')}
        icon={<HomeOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('warehouses.code') },
          { key: 'name', label: t('warehouses.name') },
          { key: 'address', label: t('warehouses.address') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="warehouses"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('warehouses.edit') : t('warehouses.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<WarehouseInput>
            control={control}
            name="code"
            label={t('warehouses.code')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<WarehouseInput>
            control={control}
            name="name"
            label={t('warehouses.name')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<WarehouseInput>
            control={control}
            name="address"
            label={t('warehouses.address')}
            errors={errors}
          >
            <Input />
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
