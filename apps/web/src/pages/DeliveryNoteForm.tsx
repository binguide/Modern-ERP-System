import { useEffect, useState } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Input, InputNumber, Select, DatePicker, Button, Table, App, Spin, Modal } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { deliveryNotesApi, type DeliveryNote } from '@lib/api/endpoints/delivery-notes';
import { customersApi, type CustomerItem } from '@lib/api/endpoints/customers';
import { unitsOfMeasureApi } from '@lib/api/endpoints/units-of-measure';
import { ItemSelector } from '@components/ItemSelector';
import {
  ErpForm,
  ErpFormHeader,
  ErpFormToolbar,
  ErpFormTabs,
  ErpFieldGrid,
  ErpField,
  ErpFormSidebar,
} from '@components/Erp';

const schema = z.object({
  deliveryDate: z.string().min(1),
  customerId: z.string().min(1),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface LineRow {
  _key: string;
  itemId?: string;
  unit?: string;
  quantity: number;
  rate: number;
  amount: number;
}

function createEmptyLine(): LineRow {
  return {
    _key: Math.random().toString(36).slice(2, 8),
    itemId: undefined,
    unit: undefined,
    quantity: 1,
    rate: 0,
    amount: 0,
  };
}

export default function DeliveryNoteFormPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [lines, setLines] = useState<LineRow[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ value: string; label: string }[]>([]);
  const [note, setNote] = useState<DeliveryNote | null>(null);
  const [status, setStatus] = useState('draft');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryDate: dayjs().format('YYYY-MM-DD'), customerId: '', notes: '' },
  });

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    customersApi.findAll({ limit: 500 }).then((res) => setCustomers(res.data));
  }, []);

  useEffect(() => {
    unitsOfMeasureApi
      .findAll({ limit: 999 })
      .then((res) =>
        setUnitOptions(res.data.map((u) => ({ value: u.code, label: `${u.code} - ${u.name}` }))),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    deliveryNotesApi
      .getById(id)
      .then((r: DeliveryNote) => {
        setNote(r);
        setStatus(r.status);
        reset({
          deliveryDate: r.deliveryDate,
          customerId: r.customerId,
          notes: r.notes || '',
        });
        setLines(
          (r.lines || []).map(
            (l): LineRow => ({
              _key: Math.random().toString(36).slice(2, 8),
              itemId: l.itemId,
              unit: l.unit,
              quantity: l.quantity,
              rate: l.rate,
              amount: l.amount,
            }),
          ),
        );
      })
      .catch(() => {
        message.error(t('errors.loadError'));
        navigate('/delivery-notes');
      })
      .finally(() => setLoading(false));
  }, [id, reset, message, t, navigate]);

  function recalcLine(index: number) {
    setLines((prev) => {
      const next = [...prev];
      const l = next[index];
      if (!l) return prev;
      next[index] = { ...l, amount: (Number(l.quantity) || 0) * (Number(l.rate) || 0) };
      return next;
    });
  }

  function updateLine(index: number, field: string, value: string | number | null) {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as LineRow;
      return next;
    });
    setTimeout(() => recalcLine(index), 0);
  }

  function addLine() {
    setLines((prev) => [...prev, createEmptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);

  const formatted = (v: number) =>
    v.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lineColumns = [
    {
      title: '',
      key: 'idx',
      width: 32,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ color: '#9ca3af', fontSize: 12 }}>{index + 1}</span>
      ),
    },
    {
      title: t('common.item'),
      key: 'item',
      width: 180,
      render: (_: unknown, __: unknown, index: number) => (
        <ItemSelector
          value={lines[index]?.itemId}
          onChange={(val) => updateLine(index, 'itemId', val)}
        />
      ),
    },
    {
      title: t('common.unit'),
      key: 'unit',
      width: 90,
      render: (_: unknown, __: unknown, index: number) => (
        <Select
          size="small"
          variant="borderless"
          value={lines[index]?.unit || undefined}
          onChange={(v) => updateLine(index, 'unit', v)}
          options={unitOptions}
          placeholder={t('common.unit')}
        />
      ),
    },
    {
      title: t('deliveryNotes.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          precision={2}
          value={lines[index]?.quantity}
          onChange={(v) => updateLine(index, 'quantity', v)}
        />
      ),
    },
    {
      title: t('deliveryNotes.rate'),
      dataIndex: 'rate',
      key: 'rate',
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          precision={2}
          value={lines[index]?.rate}
          onChange={(v) => updateLine(index, 'rate', v)}
        />
      ),
    },
    {
      title: t('deliveryNotes.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ fontWeight: 500 }}>{formatted(lines[index]?.amount || 0)}</span>
      ),
    },
    {
      key: 'actions',
      width: 32,
      render: (_: unknown, __: unknown, index: number) => (
        <Button
          type="text"
          size="small"
          className="erp-delete-line-btn"
          icon={<CloseOutlined style={{ fontSize: 12 }} />}
          onClick={() => removeLine(index)}
        />
      ),
    },
  ];

  const onSubmit = async (values: FormValues) => {
    if (!values.customerId) {
      message.error(t('validation.required', { field: t('deliveryNotes.customer') }));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        deliveryDate: values.deliveryDate,
        customerId: values.customerId,
        notes: values.notes || undefined,
        lines: lines.map((l) => ({
          itemId: l.itemId || undefined,
          unit: l.unit || undefined,
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          amount: Number(l.amount || 0),
        })),
      };

      if (isEdit) {
        await deliveryNotesApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        await deliveryNotesApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/delivery-notes');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAction = () => {
    if (!id) return;
    setSaving(true);
    deliveryNotesApi
      .submit(id)
      .then(() => {
        message.success(t('common.updated'));
        setStatus('confirmed');
        reset({}, { keepValues: true });
      })
      .catch(() => message.error(t('errors.saveError')))
      .finally(() => setSaving(false));
  };

  const handleCancelAction = () => {
    if (!id) return;
    Modal.confirm({
      title: t('common.confirmCancel'),
      onOk: async () => {
        setSaving(true);
        try {
          await deliveryNotesApi.cancel(id);
          message.success(t('common.updated'));
          setStatus('cancelled');
          reset({}, { keepValues: true });
        } catch {
          message.error(t('errors.saveError'));
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleDelete = () => {
    if (!id) return;
    Modal.confirm({
      title: t('common.confirmDelete'),
      onOk: async () => {
        setSaving(true);
        try {
          await deliveryNotesApi.delete(id);
          message.success(t('common.deleted'));
          navigate('/delivery-notes');
        } catch {
          message.error(t('errors.deleteError'));
        } finally {
          setSaving(false);
        }
      },
    });
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />;

  const toolbarStatus = !isEdit
    ? 'draft'
    : status === 'draft'
      ? 'saved'
      : status === 'confirmed'
        ? 'confirmed'
        : 'cancelled';
  const isDraft = status === 'draft';
  const isConfirmed = status === 'confirmed';

  return (
    <div className="erpnext-form">
      <ErpFormHeader
        title={isEdit ? note?.deliveryNumber || t('deliveryNotes.edit') : t('deliveryNotes.create')}
        status={isEdit ? status : undefined}
        statusLabel={isEdit ? t(`deliveryNotes.status_${status}`) : undefined}
        isDirty={isDirty}
        onBack={() => navigate('/delivery-notes')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <ErpFormToolbar
        status={toolbarStatus}
        isDirty={isDirty}
        saving={saving}
        onSave={handleSubmit(onSubmit)}
        onDiscard={() => navigate('/delivery-notes')}
        onSubmit={isEdit && isDraft ? handleSubmitAction : undefined}
        onCancelOrder={isEdit && isConfirmed ? handleCancelAction : undefined}
        extra={
          isEdit && isDraft ? (
            <Button danger size="small" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          ) : undefined
        }
      />
      <ErpForm sidebar={<ErpFormSidebar />} sidebarOpen={sidebarOpen}>
        <ErpFormTabs
          tabs={[{ key: 'details', label: t('common.details') }]}
          activeKey="details"
          onChange={() => {}}
        >
          <ErpFieldGrid>
            <ErpField label={t('deliveryNotes.customer')} required>
              <Controller
                control={control}
                name="customerId"
                render={({ field, fieldState }) => (
                  <div>
                    <Select
                      showSearch
                      placeholder={t('deliveryNotes.selectCustomer')}
                      optionFilterProp="label"
                      style={{ width: '100%' }}
                      value={field.value || undefined}
                      onChange={field.onChange}
                      status={fieldState.error ? 'error' : undefined}
                      options={customers.map((c) => ({
                        value: c.id,
                        label: `${c.code} - ${c.name}`,
                      }))}
                    />
                    {fieldState.error && (
                      <span style={{ color: '#ef4444', fontSize: 11 }}>
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </ErpField>
            <ErpField label={t('deliveryNotes.deliveryDate')} required>
              <Controller
                control={control}
                name="deliveryDate"
                render={({ field, fieldState }) => (
                  <div>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : '')}
                      status={fieldState.error ? 'error' : undefined}
                    />
                    {fieldState.error && (
                      <span style={{ color: '#ef4444', fontSize: 11 }}>
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </ErpField>
            <ErpField label={t('deliveryNotes.notes')} fullWidth>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => <Input.TextArea rows={2} {...field} />}
              />
            </ErpField>
          </ErpFieldGrid>
        </ErpFormTabs>
      </ErpForm>

      <div style={{ padding: '0 24px' }}>
        <div className="erp-items-table">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              {t('deliveryNotes.lines')}
            </span>
          </div>
          <Table
            dataSource={lines}
            columns={lineColumns}
            rowKey="_key"
            pagination={false}
            size="small"
            bordered={false}
          />
          {isDraft && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addLine}>
                {t('deliveryNotes.addLine')}
              </Button>
            </div>
          )}
        </div>

        <div className="erp-totals-block">
          <table className="erp-totals-table">
            <tbody>
              <tr className="erp-grand-total">
                <td>{t('deliveryNotes.total')}</td>
                <td>{formatted(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={t('common.unsavedChanges')}
        open={blocker.state === 'blocked'}
        onOk={blocker.proceed}
        onCancel={blocker.reset}
        okText={t('common.leave')}
        cancelText={t('common.stay')}
      >
        {t('common.unsavedChangesMessage')}
      </Modal>
    </div>
  );
}
