import { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Switch, Button, App } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fiscalYearsApi, FiscalYearItem } from '@lib/api/endpoints/fiscal-years';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';
import dayjs from 'dayjs';

export default function FiscalYearsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FiscalYearItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const grid = useDataGrid<FiscalYearItem>({
    fetchFn: (params) => fiscalYearsApi.findAll(params as Record<string, unknown>),
    storageKey: 'fiscal-years-list-columns',
    columnKeys: ['code', 'startDate', 'endDate', 'isDefault', 'isClosed'],
    groupOptions: [{ value: 'isClosed', label: t('common.status') }],
    getGroupConfig: () => ({
      getGroupValue: (item) => (item.isClosed ? 'closed' : 'open'),
      getGroupLabel: (v) => (v === 'closed' ? t('fiscalYears.closed') : t('fiscalYears.open')),
    }),
    defaultParams: { sortBy: 'startDate', sortOrder: 'DESC' },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (fy: FiscalYearItem) => {
      setEditing(fy);
      form.setFieldsValue({
        ...fy,
        startDate: dayjs(fy.startDate),
        endDate: dayjs(fy.endDate),
      });
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
            await fiscalYearsApi.remove(id);
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
      const payload = {
        code: values.code as string,
        startDate: (values.startDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        endDate: (values.endDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        isDefault: values.isDefault as boolean,
      };
      if (editing) {
        await fiscalYearsApi.update(editing.id, payload);
        message.success(t('common.updated'));
      } else {
        await fiscalYearsApi.create(payload);
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
    { title: t('fiscalYears.code'), key: 'code', dataIndex: 'code', sorter: true, width: 120 },
    {
      title: t('fiscalYears.startDate'),
      key: 'startDate',
      dataIndex: 'startDate',
      sorter: true,
      width: 140,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: t('fiscalYears.endDate'),
      key: 'endDate',
      dataIndex: 'endDate',
      sorter: true,
      width: 140,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: t('fiscalYears.default'),
      key: 'isDefault',
      width: 100,
      render: (v: boolean) => (v ? <OdooTag color="blue">{t('common.yes')}</OdooTag> : '-'),
    },
    {
      title: t('common.status'),
      dataIndex: 'isClosed',
      key: 'isClosed',
      sorter: true,
      width: 100,
      render: (v: boolean) =>
        v ? (
          <OdooTag color="red">{t('fiscalYears.closed')}</OdooTag>
        ) : (
          <OdooTag color="green">{t('fiscalYears.open')}</OdooTag>
        ),
    },
  ];

  return (
    <>
      <DataGrid<FiscalYearItem>
        {...grid}
        title={t('menu.fiscalYears')}
        icon={<CalendarOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('fiscalYears.code') },
          { key: 'startDate', label: t('fiscalYears.startDate') },
          { key: 'endDate', label: t('fiscalYears.endDate') },
          { key: 'isDefault', label: t('fiscalYears.default') },
          { key: 'isClosed', label: t('common.status') },
        ]}
        basePath="fiscal-years"
        groupOptions={[{ value: 'isClosed', label: t('common.status') }]}
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('fiscalYears.edit') : t('fiscalYears.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="code"
            label={t('fiscalYears.code')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('fiscalYears.code') }),
              },
            ]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item
            name="startDate"
            label={t('fiscalYears.startDate')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('fiscalYears.startDate') }),
              },
            ]}
          >
            <DatePicker style={{ width: '100%' }} picker="date" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label={t('fiscalYears.endDate')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('fiscalYears.endDate') }),
              },
            ]}
          >
            <DatePicker style={{ width: '100%' }} picker="date" />
          </Form.Item>
          <Form.Item name="isDefault" label={t('fiscalYears.default')} valuePropName="checked">
            <Switch />
          </Form.Item>
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
