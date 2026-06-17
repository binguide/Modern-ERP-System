import { useState, useCallback, useEffect } from 'react';
import type { TreeDataNode } from 'antd';
import {
  Modal,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, accountTypeEnum, type AccountInput } from '@modern-erp/shared-schemas';
import { accountsApi, AccountItem } from '@lib/api/endpoints/accounts';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { FormField } from '@components/FormField';

const { Text } = Typography;

const ACCOUNT_TYPES = accountTypeEnum.options;

export default function ChartOfAccountsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [treeData, setTreeData] = useState<AccountItem[]>([]);
  const [flatAccounts, setFlatAccounts] = useState<AccountItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: { code: '', name: '', type: 'asset', isActive: true, openingBalance: 0 },
  });

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
      reset({
        code: '',
        name: '',
        type: 'asset',
        isActive: true,
        openingBalance: 0,
        parentId: parentId ?? undefined,
      });
      setModalOpen(true);
    },
    [reset],
  );

  const openEdit = useCallback(
    (account: AccountItem) => {
      setEditing(account);
      reset({
        code: account.code,
        name: account.name,
        type: account.type,
        isActive: account.isActive,
        openingBalance: Number(account.openingBalance ?? 0),
        parentId: account.parentId ?? undefined,
      });
      setModalOpen(true);
    },
    [reset],
  );

  useEffect(() => {
    if (!modalOpen) setEditing(null);
  }, [modalOpen]);

  const onSubmit = async (values: AccountInput) => {
    setSaving(true);
    try {
      if (editing) {
        await accountsApi.update(editing.id, values);
        message.success(t('common.updated'));
      } else {
        await accountsApi.create(values);
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

  const renderTreeNodes = (items: AccountItem[]): TreeDataNode[] =>
    items.map((item) => ({
      key: item.id,
      title: (
        <Space size={4} style={{ cursor: 'pointer' }} onClick={() => openEdit(item)}>
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
    <div className="erpnext-list">
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<AccountInput>
            control={control}
            name="code"
            label={t('accounts.code')}
            errors={errors}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </FormField>
          <FormField<AccountInput>
            control={control}
            name="name"
            label={t('accounts.name')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<AccountInput>
            control={control}
            name="type"
            label={t('accounts.type')}
            errors={errors}
          >
            <Select
              options={ACCOUNT_TYPES.map((type) => ({ value: type, label: t(`accounts.${type}`) }))}
            />
          </FormField>
          <FormField<AccountInput>
            control={control}
            name="parentId"
            label={t('accounts.parent')}
            errors={errors}
          >
            <Select allowClear placeholder={t('accounts.noParent')} options={parentOptions} />
          </FormField>
          <FormField<AccountInput>
            control={control}
            name="openingBalance"
            label={t('accounts.openingBalance')}
            errors={errors}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </FormField>
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
