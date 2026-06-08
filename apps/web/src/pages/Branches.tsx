import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Card, App, Modal, Form, Input, Switch, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  branchesApi,
  BranchItem,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '@lib/api/endpoints/branches';

export default function BranchesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await branchesApi.findAll();
      setBranches(data);
    } catch {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const openCreate = () => {
    setEditingBranch(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (branch: BranchItem) => {
    setEditingBranch(branch);
    form.setFieldsValue(branch);
    setModalOpen(true);
  };

  const handleDelete = (branch: BranchItem) => {
    Modal.confirm({
      title: t('common.confirmDelete'),
      onOk: async () => {
        try {
          await branchesApi.remove(branch.id);
          message.success(t('common.deleted'));
          void fetchBranches();
        } catch {
          message.error(t('common.error'));
        }
      },
    });
  };

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
      void fetchBranches();
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: t('branches.name'), key: 'name', dataIndex: 'name', width: 200 },
    { title: t('branches.code'), key: 'code', dataIndex: 'code', width: 120 },
    {
      title: t('branches.default'),
      key: 'isDefault',
      width: 100,
      render: (_: unknown, record: BranchItem) =>
        record.isDefault ? <Tag color="blue">{t('common.yes')}</Tag> : '-',
    },
    {
      title: t('common.status'),
      key: 'isActive',
      width: 100,
      render: (_: unknown, record: BranchItem) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: BranchItem) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('menu.branches')}
        </Typography.Title>
        <Space>
          <Button icon={<SyncOutlined />} onClick={() => fetchBranches()} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('common.create')}
          </Button>
        </Space>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={branches}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

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
    </div>
  );
}
