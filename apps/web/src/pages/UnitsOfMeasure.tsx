import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, Switch, Button, App, Form } from 'antd';
import { ZoomInOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { unitOfMeasureSchema, type UnitOfMeasureInput } from '@modern-erp/shared-schemas';
import { unitsOfMeasureApi, UnitOfMeasureItem } from '@lib/api/endpoints/units-of-measure';
import { FormField } from '@components/FormField';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function UnitsOfMeasurePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UnitOfMeasureItem | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UnitOfMeasureInput>({
    resolver: zodResolver(unitOfMeasureSchema),
    defaultValues: { code: '', name: '', isActive: true },
  });

  const grid = useDataGrid<UnitOfMeasureItem>({
    fetchFn: (params) => unitsOfMeasureApi.findAll(params as Record<string, unknown>),
    storageKey: 'units-of-measure-list-columns',
    columnKeys: ['code', 'name', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ code: '', name: '', isActive: true });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (item: UnitOfMeasureItem) => {
      setEditing(item);
      reset({ code: item.code, name: item.name, isActive: item.isActive });
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
            await unitsOfMeasureApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const onSubmit = async (values: UnitOfMeasureInput) => {
    setSaving(true);
    try {
      if (editing) {
        await unitsOfMeasureApi.update(editing.id, values);
        message.success(t('common.updated'));
      } else {
        await unitsOfMeasureApi.create(values);
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
    { title: t('unitsOfMeasure.code'), key: 'code', dataIndex: 'code', sorter: true, width: 100 },
    { title: t('unitsOfMeasure.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
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
      <DataGrid<UnitOfMeasureItem>
        {...grid}
        title={t('menu.unitsOfMeasure')}
        icon={<ZoomInOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('unitsOfMeasure.code') },
          { key: 'name', label: t('unitsOfMeasure.name') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="units-of-measure"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('unitsOfMeasure.edit') : t('unitsOfMeasure.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<UnitOfMeasureInput>
            control={control}
            name="code"
            label={t('unitsOfMeasure.code')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<UnitOfMeasureInput>
            control={control}
            name="name"
            label={t('unitsOfMeasure.name')}
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
