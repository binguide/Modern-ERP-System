import { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  App,
  Tree,
  Card,
  Space,
  Typography,
} from 'antd';
import { BookOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { accountsApi, AccountItem } from '@lib/api/endpoints/accounts';
import { OdooTag } from '@components/OdooTag/OdooTag';

const { Text } = Typography;

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'income', 'expense'];

export default function ChartOfAccountsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [treeData, setTreeData] = useState<AccountItem[]>([]);
  const [flatAccounts, setFlatAccounts] = useState<AccountItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  const fetchAccounts = useCallback(async () => {
    try {
      const [tree, flat] = await Promise.all([accountsApi.findTree(), accountsApi.findAll()]);
      setTreeData(tree);
      setFlatAccounts(flat);
    } catch {
      message.error(t('common.error'));
    }
  }, [message, t]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const openCreate = useCallback(
    (parentId?: string) => {
      setEditing(null);
      form.resetFields();
      if (parentId) form.setFieldValue('parentId', parentId);
      setModalOpen(true);
    },
    [form],
  );

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing) {
        await accountsApi.update(editing.id, values as unknown);
        message.success(t('common.updated'));
      } else {
        await accountsApi.create(values as unknown);
        message.success(t('common.created'));
      }
      setModalOpen(false);
      fetchAccounts();
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!modalOpen) setEditing(null);
  }, [modalOpen]);

  const renderTreeNodes = (items: AccountItem[]): unknown[] =>
    items.map((item) => ({
      key: item.id,
      title: (
        <Space size={4}>
          <Text strong style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>
            {item.code}
          </Text>
          <Text>{item.name}</Text>
          <OdooTag
            color={item.isActive ? 'green' : 'red'}
            style={{ fontSize: 11, lineHeight: '18px' }}
          >
            {item.isActive ? t('common.active') : t('common.inactive')}
          </OdooTag>
          <Text style={{ fontSize: 11, color: '#999' }}>{t(`accounts.${item.type}`)}</Text>
          <Text style={{ fontSize: 12, color: '#555', fontFamily: 'monospace' }}>
            {Number(item.currentBalance).toLocaleString()}
          </Text>
        </Space>
      ),
      icon: <BookOutlined style={{ fontSize: 14 }} />,
      children: item.children?.length ? renderTreeNodes(item.children) : undefined,
    }));

  const parentOptions = flatAccounts
    .filter((a) => a.id !== editing?.id)
    .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));

  return (
    <div>
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>{t('menu.chartOfAccounts')}</span>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
              {t('accounts.create')}
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Tree
          showIcon
          treeData={renderTreeNodes(treeData)}
          selectedKeys={selectedKeys}
          onSelect={(keys) => setSelectedKeys(keys as string[])}
          style={{ background: 'transparent' }}
        />
      </Card>

      <Modal
        title={editing ? t('accounts.edit') : t('accounts.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="code"
            label={t('accounts.code')}
            rules={[
              { required: true, message: t('validation.required', { field: t('accounts.code') }) },
            ]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('accounts.name')}
            rules={[
              { required: true, message: t('validation.required', { field: t('accounts.name') }) },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label={t('accounts.type')}
            rules={[
              { required: true, message: t('validation.required', { field: t('accounts.type') }) },
            ]}
          >
            <Select
              options={ACCOUNT_TYPES.map((type) => ({ value: type, label: t(`accounts.${type}`) }))}
            />
          </Form.Item>
          <Form.Item name="parentId" label={t('accounts.parent')}>
            <Select allowClear placeholder={t('accounts.noParent')} options={parentOptions} />
          </Form.Item>
          <Form.Item name="openingBalance" label={t('accounts.openingBalance')}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
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
