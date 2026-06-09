import { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, App } from 'antd';
import { ZoomInOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { unitsOfMeasureApi, UnitOfMeasureItem } from '@lib/api/endpoints/units-of-measure';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function UnitsOfMeasurePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UnitOfMeasureItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const grid = useDataGrid<UnitOfMeasureItem>({
    fetchFn: (params) => unitsOfMeasureApi.findAll(params as Record<string, unknown>),
    storageKey: 'units-of-measure-list-columns',
    columnKeys: ['code', 'name', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (item: UnitOfMeasureItem) => {
      setEditing(item);
      form.setFieldsValue(item);
      setModalOpen(true);
    },
    [form],
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

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing) {
        await unitsOfMeasureApi.update(editing.id, values as unknown);
        message.success(t('common.updated'));
      } else {
        await unitsOfMeasureApi.create(values as unknown);
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
    <>
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
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="code"
            label={t('unitsOfMeasure.code')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('unitsOfMeasure.code') }),
              },
            ]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('unitsOfMeasure.name')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('unitsOfMeasure.name') }),
              },
            ]}
          >
            <Input />
          </Form.Item>
          {editing && (
            <Form.Item name="isActive" label={t('common.status')} valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
