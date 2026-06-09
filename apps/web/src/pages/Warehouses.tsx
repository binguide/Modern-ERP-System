import { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, App } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { warehousesApi, WarehouseItem } from '@lib/api/endpoints/warehouses';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function WarehousesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const grid = useDataGrid<WarehouseItem>({
    fetchFn: (params) => warehousesApi.findAll(params as Record<string, unknown>),
    storageKey: 'warehouses-list-columns',
    columnKeys: ['code', 'name', 'address', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (wh: WarehouseItem) => {
      setEditing(wh);
      form.setFieldsValue(wh);
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

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing) {
        await warehousesApi.update(editing.id, values as unknown);
        message.success(t('common.updated'));
      } else {
        await warehousesApi.create(values as unknown);
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
    <>
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
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="code"
            label={t('warehouses.code')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('warehouses.code') }),
              },
            ]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('warehouses.name')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('warehouses.name') }),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="address" label={t('warehouses.address')}>
            <Input.TextArea rows={2} />
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
