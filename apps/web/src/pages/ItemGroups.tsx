import { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, App } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { itemGroupsApi, ItemGroupItem } from '@lib/api/endpoints/item-groups';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function ItemGroupsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ItemGroupItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const grid = useDataGrid<ItemGroupItem>({
    fetchFn: (params) => itemGroupsApi.findAll(params as Record<string, unknown>),
    storageKey: 'item-groups-list-columns',
    columnKeys: ['code', 'name', 'description', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (item: ItemGroupItem) => {
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
            await itemGroupsApi.remove(id);
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
        await itemGroupsApi.update(editing.id, values as unknown);
        message.success(t('common.updated'));
      } else {
        await itemGroupsApi.create(values as unknown);
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
    { title: t('itemGroups.code'), key: 'code', dataIndex: 'code', sorter: true, width: 100 },
    { title: t('itemGroups.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    {
      title: t('itemGroups.description'),
      key: 'description',
      dataIndex: 'description',
      width: 300,
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
      <DataGrid<ItemGroupItem>
        {...grid}
        title={t('menu.itemGroups')}
        icon={<TagsOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('itemGroups.code') },
          { key: 'name', label: t('itemGroups.name') },
          { key: 'description', label: t('itemGroups.description') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="item-groups"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('itemGroups.edit') : t('itemGroups.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="code"
            label={t('itemGroups.code')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('itemGroups.code') }),
              },
            ]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('itemGroups.name')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('itemGroups.name') }),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('itemGroups.description')}>
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
