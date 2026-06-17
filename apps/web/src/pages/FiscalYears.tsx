import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, DatePicker, Switch, Button, App, Form } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { fiscalYearsApi, FiscalYearItem } from '@lib/api/endpoints/fiscal-years';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';
import dayjs from 'dayjs';

interface FiscalYearFormValues {
  code: string;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  isDefault: boolean;
}

export default function FiscalYearsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FiscalYearItem | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FiscalYearFormValues>({
    defaultValues: { code: '', startDate: null, endDate: null, isDefault: false },
  });

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
    reset({ code: '', startDate: null, endDate: null, isDefault: false });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (fy: FiscalYearItem) => {
      setEditing(fy);
      reset({
        code: fy.code,
        startDate: dayjs(fy.startDate),
        endDate: dayjs(fy.endDate),
        isDefault: fy.isDefault,
      });
      setModalOpen(true);
    },
    [reset],
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

  const onSubmit = async (values: FiscalYearFormValues) => {
    if (!values.code) {
      message.error(t('validation.required', { field: t('fiscalYears.code') }));
      return;
    }
    if (!values.startDate) {
      message.error(t('validation.required', { field: t('fiscalYears.startDate') }));
      return;
    }
    if (!values.endDate) {
      message.error(t('validation.required', { field: t('fiscalYears.endDate') }));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: values.code,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        isDefault: values.isDefault,
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
    <div className="erpnext-list">
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('fiscalYears.code')}
                validateStatus={errors.code ? 'error' : undefined}
                help={errors.code?.message}
              >
                <Input {...field} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            )}
          />
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('fiscalYears.startDate')}
                validateStatus={errors.startDate ? 'error' : undefined}
                help={errors.startDate?.message}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('fiscalYears.endDate')}
                validateStatus={errors.endDate ? 'error' : undefined}
                help={errors.endDate?.message}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="isDefault"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Form.Item label={t('fiscalYears.default')}>
                <Switch checked={!!value} onChange={onChange} />
              </Form.Item>
            )}
          />
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
