import { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, App } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  branchesApi,
  BranchItem,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '@lib/api/endpoints/branches';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function BranchesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const grid = useDataGrid<BranchItem>({
    fetchFn: (params) => branchesApi.findAll(params as Record<string, unknown>),
    storageKey: 'branches-list-columns',
    columnKeys: ['name', 'code', 'isDefault', 'isActive'],
    groupOptions: [{ value: 'isActive', label: t('common.status') }],
    getGroupConfig: () => ({
      getGroupValue: (item) => (item.isActive ? 'active' : 'inactive'),
      getGroupLabel: (v) => (v === 'active' ? t('common.active') : t('common.inactive')),
    }),
  });

  const openCreate = useCallback(() => {
    setEditingBranch(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (branch: BranchItem) => {
      setEditingBranch(branch);
      form.setFieldsValue(branch);
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
            await branchesApi.remove(id);
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
      if (editingBranch) {
        const payload: UpdateBranchPayload = {
          name: values.name as string,
          code: values.code as string,
          isDefault: values.isDefault as boolean,
          isActive: values.isActive as boolean,
        };
        await branchesApi.update(editingBranch.id, payload);
        message.success(t('common.updated'));
      } else {
        const payload: CreateBranchPayload = {
          name: values.name as string,
          code: values.code as string,
          isDefault: values.isDefault as boolean,
          isActive: values.isActive as boolean,
        };
        await branchesApi.create(payload);
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!modalOpen) {
      setEditingBranch(null);
    }
  }, [modalOpen]);

  const columns = [
    {
      title: t('branches.name'),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      width: 200,
    },
    {
      title: t('branches.code'),
      key: 'code',
      dataIndex: 'code',
      sorter: true,
      width: 120,
    },
    {
      title: t('branches.default'),
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
      <DataGrid<BranchItem>
        {...grid}
        title={t('menu.branches')}
        icon={<BankOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'name', label: t('branches.name') },
          { key: 'code', label: t('branches.code') },
          { key: 'isDefault', label: t('branches.default') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="branches"
        groupOptions={[{ value: 'isActive', label: t('common.status') }]}
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editingBranch ? t('branches.edit') : t('branches.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label={t('branches.name')}
            rules={[
              { required: true, message: t('validation.required', { field: t('branches.name') }) },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label={t('branches.code')}
            rules={[
              { required: true, message: t('validation.required', { field: t('branches.code') }) },
            ]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="isDefault" label={t('branches.default')} valuePropName="checked">
            <Switch />
          </Form.Item>
          {editingBranch && (
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
