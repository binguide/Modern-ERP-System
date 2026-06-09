import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  App,
  Space,
  Table,
  InputNumber,
  Typography,
  Popconfirm,
  Tag,
} from 'antd';
const { Text } = Typography;
import {
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  journalEntriesApi,
  JournalEntryItem,
  JournalEntryLinePayload,
} from '@lib/api/endpoints/journal-entries';
import { fiscalYearsApi, FiscalYearItem } from '@lib/api/endpoints/fiscal-years';
import { periodsApi, PeriodItem } from '@lib/api/endpoints/periods';
import { accountsApi, AccountItem } from '@lib/api/endpoints/accounts';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';
import dayjs from 'dayjs';

export default function JournalEntriesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [fiscalYears, setFiscalYears] = useState<FiscalYearItem[]>([]);
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [lines, setLines] = useState<JournalEntryLinePayload[]>([]);
  const [form] = Form.useForm();
  const fetchRef = useRef(false);

  const grid = useDataGrid<JournalEntryItem>({
    fetchFn: (params) => journalEntriesApi.findAll(params as Record<string, unknown>),
    storageKey: 'journal-entries-list-columns',
    columnKeys: ['number', 'date', 'description', 'status', 'totalDebit', 'totalCredit'],
    defaultParams: { sortBy: 'createdAt', sortOrder: 'DESC' },
  });

  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      Promise.all([fiscalYearsApi.findAll({ limit: 100 }), accountsApi.findAll()])
        .then(([fyRes, accRes]) => {
          setFiscalYears(fyRes.data);
          setAccounts(accRes);
        })
        .catch(() => {});
    }
  }, []);

  const loadPeriods = useCallback(async (fiscalYearId: string) => {
    try {
      const res = await periodsApi.findAll({ fiscalYearId, limit: 100 });
      setPeriods(res.data);
    } catch {
      setPeriods([]);
    }
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    setLines([
      { accountId: '', debit: 0, credit: 0 },
      { accountId: '', debit: 0, credit: 0 },
    ]);
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    async (entry: JournalEntryItem) => {
      if (entry.status !== 'draft') {
        message.info(t('journalEntries.posted'));
        return;
      }
      setEditing(entry);
      form.setFieldsValue({
        date: dayjs(entry.date),
        description: entry.description,
        fiscalYearId: entry.fiscalYearId,
        periodId: entry.periodId,
        reference: entry.reference,
      });
      if (entry.fiscalYearId) await loadPeriods(entry.fiscalYearId);
      setLines(
        entry.lines?.map((l) => ({
          accountId: l.accountId,
          description: l.description || '',
          debit: Number(l.debit),
          credit: Number(l.credit),
        })) || [],
      );
      setModalOpen(true);
    },
    [form, loadPeriods, message, t],
  );

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await journalEntriesApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, { accountId: '', debit: 0, credit: 0 }]);
  }, []);

  const removeLine = useCallback((index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateLine = useCallback((index: number, field: string, value: unknown) => {
    setLines((prev) => {
      const next = [...prev];
      (next as unknown as JournalEntryLinePayload[])[index][field] = value;
      return next;
    });
  }, []);

  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handlePost = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: t('journalEntries.confirmPost'),
        onOk: async () => {
          try {
            await journalEntriesApi.post(id);
            message.success(t('journalEntries.posted'));
            grid.refresh();
          } catch {
            message.error(t('common.error'));
          }
        },
      });
    },
    [message, t, grid],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      try {
        await journalEntriesApi.cancel(id);
        message.success(t('journalEntries.cancelled'));
        grid.refresh();
      } catch {
        message.error(t('common.error'));
      }
    },
    [message, t, grid],
  );

  const onFinish = async (values: Record<string, unknown>) => {
    if (!isBalanced) {
      message.error(t('journalEntries.unbalanced'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date: (values.date as dayjs.Dayjs).format('YYYY-MM-DD'),
        description: (values.description as string) || undefined,
        fiscalYearId: values.fiscalYearId as string,
        periodId: values.periodId as string,
        reference: (values.reference as string) || undefined,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          description: l.description || undefined,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
        })),
      };
      if (editing) {
        await journalEntriesApi.update(editing.id, payload);
        message.success(t('common.updated'));
      } else {
        await journalEntriesApi.create(payload);
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
    if (!modalOpen) {
      setEditing(null);
      setLines([]);
    }
  }, [modalOpen]);

  const statusColors: Record<string, string> = {
    draft: 'orange',
    posted: 'green',
    cancelled: 'red',
  };

  const columns = [
    {
      title: t('journalEntries.number'),
      key: 'number',
      dataIndex: 'number',
      sorter: true,
      width: 100,
    },
    {
      title: t('journalEntries.date'),
      key: 'date',
      dataIndex: 'date',
      sorter: true,
      width: 120,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: t('journalEntries.description'),
      key: 'description',
      dataIndex: 'description',
      ellipsis: true,
    },
    { title: t('journalEntries.reference'), key: 'reference', dataIndex: 'reference', width: 120 },
    {
      title: t('journalEntries.status'),
      key: 'status',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => (
        <OdooTag color={statusColors[v] || 'default'}>{t(`journalEntries.${v}`)}</OdooTag>
      ),
    },
    {
      title: t('journalEntries.totalDebit'),
      key: 'totalDebit',
      dataIndex: 'totalDebit',
      width: 120,
      render: (v: number) => Number(v).toLocaleString(),
    },
    {
      title: t('journalEntries.totalCredit'),
      key: 'totalCredit',
      dataIndex: 'totalCredit',
      width: 120,
      render: (v: number) => Number(v).toLocaleString(),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: JournalEntryItem) => (
        <Space>
          {record.status === 'draft' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handlePost(record.id)}
              />
              <Popconfirm
                title={t('common.confirmDelete')}
                onConfirm={() => journalEntriesApi.remove(record.id).then(() => grid.refresh())}
              >
                <Button type="link" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
          {record.status === 'posted' && (
            <Button
              type="link"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancel(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const accountOptions = accounts
    .filter((a) => a.isActive)
    .map((a) => ({
      value: a.id,
      label: `${a.code} - ${a.name}`,
    }));

  const lineColumns = [
    {
      title: t('journalEntries.account'),
      key: 'account',
      width: 300,
      render: (_: unknown, __: unknown, index: number) => (
        <Select
          style={{ width: '100%' }}
          showSearch
          value={lines[index]?.accountId || undefined}
          onChange={(v) => updateLine(index, 'accountId', v)}
          options={accountOptions}
          placeholder={t('journalEntries.account')}
        />
      ),
    },
    {
      title: t('journalEntries.description'),
      key: 'description',
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          value={lines[index]?.description}
          onChange={(e) => updateLine(index, 'description', e.target.value)}
        />
      ),
    },
    {
      title: t('journalEntries.debit'),
      key: 'debit',
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          value={lines[index]?.debit}
          onChange={(v) => updateLine(index, 'debit', v)}
        />
      ),
    },
    {
      title: t('journalEntries.credit'),
      key: 'credit',
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          value={lines[index]?.credit}
          onChange={(v) => updateLine(index, 'credit', v)}
        />
      ),
    },
    {
      key: 'actions',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeLine(index)}
          disabled={lines.length <= 2}
        />
      ),
    },
  ];

  return (
    <>
      <DataGrid<JournalEntryItem>
        {...grid}
        title={t('menu.journalEntries')}
        icon={<FileTextOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'number', label: t('journalEntries.number') },
          { key: 'date', label: t('journalEntries.date') },
          { key: 'description', label: t('journalEntries.description') },
          { key: 'reference', label: t('journalEntries.reference') },
          { key: 'status', label: t('journalEntries.status') },
          { key: 'totalDebit', label: t('journalEntries.totalDebit') },
          { key: 'totalCredit', label: t('journalEntries.totalCredit') },
        ]}
        basePath="journal-entries"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('journalEntries.edit') : t('journalEntries.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Space style={{ width: '100%' }} size={12} wrap>
            <Form.Item
              name="date"
              label={t('journalEntries.date')}
              rules={[
                {
                  required: true,
                  message: t('validation.required', { field: t('journalEntries.date') }),
                },
              ]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="fiscalYearId"
              label={t('journalEntries.fiscalYear')}
              rules={[
                {
                  required: true,
                  message: t('validation.required', { field: t('journalEntries.fiscalYear') }),
                },
              ]}
            >
              <Select
                style={{ width: 160 }}
                onChange={(v) => {
                  form.setFieldValue('periodId', undefined);
                  loadPeriods(v);
                }}
                options={fiscalYears.map((fy) => ({ value: fy.id, label: fy.code }))}
              />
            </Form.Item>
            <Form.Item
              name="periodId"
              label={t('journalEntries.period')}
              rules={[
                {
                  required: true,
                  message: t('validation.required', { field: t('journalEntries.period') }),
                },
              ]}
            >
              <Select
                style={{ width: 160 }}
                options={periods.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
            <Form.Item name="reference" label={t('journalEntries.reference')}>
              <Input style={{ width: 140 }} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label={t('journalEntries.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Typography.Title level={5}>{t('journalEntries.lines')}</Typography.Title>
          <Table
            dataSource={lines.map((l, i) => ({ ...l, key: i }))}
            columns={lineColumns}
            pagination={false}
            size="small"
            footer={() => (
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button type="dashed" icon={<PlusOutlined />} onClick={addLine}>
                  {t('journalEntries.addLine')}
                </Button>
                <Space size={20}>
                  <Text>
                    {t('journalEntries.totalDebit')}: <strong>{totalDebit.toLocaleString()}</strong>
                  </Text>
                  <Text>
                    {t('journalEntries.totalCredit')}:{' '}
                    <strong>{totalCredit.toLocaleString()}</strong>
                  </Text>
                  <Tag color={isBalanced ? 'green' : 'red'}>
                    {isBalanced ? t('common.yes') : t('journalEntries.unbalanced')}
                  </Tag>
                </Space>
              </Space>
            )}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving} disabled={!isBalanced}>
              {t('common.save')}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
