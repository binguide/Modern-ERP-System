import { useEffect, useState } from 'react';
import { App, Select, DatePicker, Input, InputNumber, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import dayjs from 'dayjs';
import { purchaseInvoicesApi, type PurchaseInvoice } from '@lib/api/endpoints/purchase-invoices';
import { suppliersApi, type SupplierItem } from '@lib/api/endpoints/suppliers';
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
  ErpEditableTable,
} from '@components/Erp';

interface LineRow {
  _key: string;
  id?: string;
  itemId?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discountPct: number;
  taxRate: number;
  amount: number;
}

function createEmptyLine(): LineRow {
  return {
    _key: Math.random().toString(36).slice(2, 8),
    quantity: 1,
    rate: 0,
    discountPct: 0,
    taxRate: 0,
    amount: 0,
  };
}

function calcLineAmount(qty: number, rate: number, discountPct: number, taxRate: number): number {
  const lineTotal = qty * rate;
  const discountAmt = lineTotal * (discountPct / 100);
  const taxable = lineTotal - discountAmt;
  const taxAmt = taxable * (taxRate / 100);
  return Math.round((taxable + taxAmt) * 100) / 100;
}

export default function PurchaseInvoiceFormPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);

  const [invoiceDate, setInvoiceDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);
  const [supplierId, setSupplierId] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineRow[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ value: string; label: string }[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState<
    'draft' | 'saved' | 'confirmed' | 'submitted' | 'posted' | 'cancelled'
  >('draft');

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    suppliersApi.findAll({ limit: '500' }).then((res) => setSuppliers(res.data));
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
    purchaseInvoicesApi
      .getById(id)
      .then((inv: PurchaseInvoice) => {
        setInvoice(inv);
        setInvoiceDate(dayjs(inv.invoiceDate));
        setDueDate(inv.dueDate ? dayjs(inv.dueDate) : null);
        setSupplierId(inv.supplierId);
        setNotes(inv.notes || '');
        setStatus(
          inv.status as 'draft' | 'saved' | 'confirmed' | 'submitted' | 'posted' | 'cancelled',
        );
        setLines(
          (inv.lines || []).map(
            (l: {
              id?: string;
              itemId?: string;
              unit?: string;
              description?: string;
              quantity: number;
              rate: number;
              discountPct?: number;
              taxRate?: number;
              amount?: number;
            }): LineRow => ({
              _key: Math.random().toString(36).slice(2, 8),
              id: l.id,
              itemId: l.itemId,
              unit: l.unit,
              quantity: l.quantity,
              rate: l.rate,
              discountPct: l.discountPct || 0,
              taxRate: l.taxRate || 0,
              amount: l.amount || 0,
            }),
          ),
        );
      })
      .catch(() => {
        message.error(t('errors.loadError'));
        navigate('/purchase-invoices');
      })
      .finally(() => setLoading(false));
  }, [id, message, t, navigate]);

  function recalcLine(index: number) {
    setLines((prev) => {
      const next = [...prev];
      const l = next[index];
      if (!l) return prev;
      next[index] = {
        ...l,
        amount: calcLineAmount(
          Number(l.quantity) || 0,
          Number(l.rate) || 0,
          Number(l.discountPct) || 0,
          Number(l.taxRate) || 0,
        ),
      };
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

  const subtotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.rate) || 0), 0);
  const discountTotal = lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.rate) || 0) * ((l.discountPct || 0) / 100),
    0,
  );
  const taxTotal = lines.reduce((s, l) => {
    const lineTotal = (Number(l.quantity) || 0) * (Number(l.rate) || 0);
    const discAmt = lineTotal * ((l.discountPct || 0) / 100);
    return s + (lineTotal - discAmt) * ((l.taxRate || 0) / 100);
  }, 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const formatted = (v: number) =>
    v.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function buildPayload() {
    return {
      invoiceDate: invoiceDate.format('YYYY-MM-DD'),
      dueDate: dueDate ? dueDate.format('YYYY-MM-DD') : undefined,
      supplierId: supplierId!,
      notes: notes || undefined,
      lines: lines.map((l) => ({
        itemId: l.itemId || undefined,
        unit: l.unit || undefined,
        quantity: Number(l.quantity),
        rate: Number(l.rate),
        discountPct: Number(l.discountPct || 0),
        taxRate: Number(l.taxRate || 0),
        amount: Number(l.amount || 0),
      })),
    };
  }

  async function handleSave() {
    if (!supplierId) {
      message.error(t('validation.required', { field: t('purchaseInvoices.supplier') }));
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await purchaseInvoicesApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        await purchaseInvoicesApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/purchase-invoices');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!id) return;
    setSaving(true);
    try {
      await purchaseInvoicesApi.submit(id);
      message.success(t('common.updated'));
      navigate('/purchase-invoices');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelOrder() {
    if (!id) return;
    setSaving(true);
    try {
      await purchaseInvoicesApi.cancel(id);
      message.success(t('common.updated'));
      navigate('/purchase-invoices');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

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
      title: t('purchaseInvoices.quantity'),
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
      title: t('purchaseInvoices.rate'),
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
      title: t('purchaseInvoices.discountPct'),
      dataIndex: 'discountPct',
      key: 'discountPct',
      width: 90,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          max={100}
          precision={2}
          value={lines[index]?.discountPct}
          onChange={(v) => updateLine(index, 'discountPct', v)}
        />
      ),
    },
    {
      title: t('purchaseInvoices.taxRate'),
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 90,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          max={100}
          precision={2}
          value={lines[index]?.taxRate}
          onChange={(v) => updateLine(index, 'taxRate', v)}
        />
      ),
    },
    {
      title: t('purchaseInvoices.lineTotal'),
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
        <CloseOutlined
          style={{ fontSize: 12, cursor: 'pointer', color: '#9ca3af' }}
          onClick={() => removeLine(index)}
        />
      ),
    },
  ];

  if (loading) return null;

  return (
    <div className="erpnext-form">
      <ErpFormHeader
        title={
          isEdit
            ? invoice?.invoiceNumber || t('purchaseInvoices.edit')
            : t('purchaseInvoices.create')
        }
        status={isEdit ? status : undefined}
        statusLabel={isEdit ? t(`purchaseInvoices.status_${status}`) : undefined}
        isDirty={false}
        onBack={() => navigate('/purchase-invoices')}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />

      <ErpFormToolbar
        status={status}
        saving={saving}
        onSave={handleSave}
        onSubmit={isEdit ? handleSubmit : undefined}
        onCancelOrder={isEdit ? handleCancelOrder : undefined}
      />

      <ErpForm
        sidebarOpen={sidebarOpen}
        sidebar={
          <ErpFormSidebar
            defaultTab="activity"
            renderTab={(tab) => {
              if (tab === 'activity') {
                return (
                  <div style={{ fontSize: 12, color: '#8d99a6' }}>
                    <p>
                      {t('common.status')}: {t(`purchaseInvoices.status_${status}`)}
                    </p>
                    {invoice?.createdAt && (
                      <p>
                        {t('common.createdAt')}:{' '}
                        {dayjs(invoice.createdAt).format('YYYY-MM-DD HH:mm')}
                      </p>
                    )}
                  </div>
                );
              }
              return <p style={{ color: '#8d99a6', fontSize: 13 }}>{t('common.noData')}</p>;
            }}
          />
        }
      >
        <ErpFormTabs
          tabs={[{ key: 'details', label: t('common.details') }]}
          activeKey={activeTab}
          onChange={setActiveTab}
        >
          <ErpFieldGrid>
            <ErpField label={t('purchaseInvoices.supplier')} required>
              <Select
                showSearch
                placeholder={t('purchaseInvoices.selectSupplier')}
                optionFilterProp="label"
                style={{ width: '100%' }}
                value={supplierId}
                onChange={setSupplierId}
                options={suppliers.map((s) => ({
                  value: s.id,
                  label: `${s.code} - ${s.name}`,
                }))}
              />
            </ErpField>
            <ErpField label={t('purchaseInvoices.invoiceDate')}>
              <DatePicker
                style={{ width: '100%' }}
                value={invoiceDate}
                onChange={(d) => d && setInvoiceDate(d)}
              />
            </ErpField>
            <ErpField label={t('purchaseInvoices.dueDate')}>
              <DatePicker
                style={{ width: '100%' }}
                value={dueDate}
                onChange={(d) => setDueDate(d)}
              />
            </ErpField>
            <ErpField label={t('purchaseInvoices.notes')} fullWidth>
              <Input.TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </ErpField>
          </ErpFieldGrid>

          <ErpEditableTable
            value={lines}
            columns={lineColumns}
            rowKey="_key"
            canEdit={status === 'draft' || status === 'saved'}
            onAddRow={addLine}
          />
        </ErpFormTabs>

        <div className="erp-totals-block">
          <table className="erp-totals-table">
            <tbody>
              <tr>
                <td>{t('purchaseInvoices.subtotal')}</td>
                <td>{formatted(subtotal)}</td>
              </tr>
              <tr>
                <td>{t('purchaseInvoices.discountTotal')}</td>
                <td style={{ color: discountTotal ? '#dc2626' : undefined }}>
                  -{formatted(discountTotal)}
                </td>
              </tr>
              <tr>
                <td>{t('purchaseInvoices.taxTotal')}</td>
                <td>{formatted(taxTotal)}</td>
              </tr>
              <tr className="erp-grand-total">
                <td>{t('purchaseInvoices.total')}</td>
                <td>{formatted(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ErpForm>

      <Modal
        title={t('common.unsavedChanges')}
        open={blocker.state === 'blocked'}
        onOk={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
        okText={t('common.leave')}
        cancelText={t('common.stay')}
      />
    </div>
  );
}
