import { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Button, App } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { taxesApi, TaxItem } from '@lib/api/endpoints/taxes';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function TaxesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaxItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const grid = useDataGrid<TaxItem>({
    fetchFn: (params) => taxesApi.findAll(params as Record<string, unknown>),
    storageKey: 'taxes-list-columns',
    columnKeys: ['code', 'name', 'rate', 'type', 'isDefault', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (tax: TaxItem) => {
      setEditing(tax);
      form.setFieldsValue(tax);
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

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing) {
        await taxesApi.update(editing.id, values as unknown);
        message.success(t('common.updated'));
      } else {
        await taxesApi.create(values as unknown);
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
    <>
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
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="code"
            label={t('taxes.code')}
            rules={[
              { required: true, message: t('validation.required', { field: t('taxes.code') }) },
            ]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('taxes.name')}
            rules={[
              { required: true, message: t('validation.required', { field: t('taxes.name') }) },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="rate"
            label={t('taxes.rate')}
            rules={[
              { required: true, message: t('validation.required', { field: t('taxes.rate') }) },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Form.Item name="type" label={t('taxes.type')}>
            <Select
              options={[
                { value: 'percentage', label: t('taxes.percentage') },
                { value: 'fixed', label: t('taxes.fixed') },
              ]}
            />
          </Form.Item>
          <Form.Item name="isDefault" label={t('taxes.default')} valuePropName="checked">
            <Switch />
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
