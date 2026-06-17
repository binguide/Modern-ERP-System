import { useEffect, useState } from 'react';
import {
  Button,
  App,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Table,
  Space,
  Popconfirm,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PrinterOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import dayjs from 'dayjs';
import { purchaseOrdersApi, type PurchaseOrderItem } from '@lib/api/endpoints/purchase-orders';
import { suppliersApi, type SupplierItem } from '@lib/api/endpoints/suppliers';
import { unitsOfMeasureApi } from '@lib/api/endpoints/units-of-measure';
import { ItemSelector } from '@components/ItemSelector';
import { ErpFieldGrid, ErpField } from '@components/Erp';

const STATUS_BADGE_COLORS: Record<string, string> = {
  draft: '#6b7280',
  saved: '#2563eb',
  confirmed: '#16a34a',
  cancelled: '#dc2626',
};

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

export default function PurchaseOrderFormPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<PurchaseOrderItem | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);

  const [orderDate, setOrderDate] = useState(dayjs());
  const [supplierId, setSupplierId] = useState<string | undefined>();
  const [expectedDate, setExpectedDate] = useState<dayjs.Dayjs | null>(null);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineRow[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ value: string; label: string }[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('activity');
  const [status, setStatus] = useState('draft');

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    suppliersApi.findAll({ limit: 500 }).then((res) => setSuppliers(res.data));
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
    purchaseOrdersApi
      .findById(id)
      .then((o) => {
        setOrder(o);
        setOrderDate(dayjs(o.orderDate));
        setSupplierId(o.supplierId);
        setExpectedDate(o.expectedDate ? dayjs(o.expectedDate) : null);
        setNotes(o.notes || '');
        setStatus(o.status);
        setLines(
          (o.lines || []).map(
            (l): LineRow => ({
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
        navigate('/purchase-orders');
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
      orderDate: orderDate.format('YYYY-MM-DD'),
      supplierId: supplierId!,
      expectedDate: expectedDate ? expectedDate.format('YYYY-MM-DD') : undefined,
      notes: notes || undefined,
      lines: lines.map((l) => ({
        itemId: l.itemId || undefined,
        unit: l.unit || undefined,
        quantity: Number(l.quantity),
        rate: Number(l.rate),
        discountPct: Number(l.discountPct || 0),
        taxRate: Number(l.taxRate || 0),
      })),
    };
  }

  async function handleSave() {
    if (!supplierId) {
      message.error(t('validation.required', { field: t('purchaseOrders.supplier') }));
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await purchaseOrdersApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        await purchaseOrdersApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/purchase-orders');
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
      await purchaseOrdersApi.submit(id);
      message.success(t('common.updated'));
      navigate('/purchase-orders');
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
      await purchaseOrdersApi.cancel(id);
      message.success(t('common.updated'));
      navigate('/purchase-orders');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setSaving(true);
    try {
      await purchaseOrdersApi.remove(id);
      message.success(t('common.deleted'));
      navigate('/purchase-orders');
    } catch {
      message.error(t('errors.deleteError'));
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
      title: t('purchaseOrders.quantity'),
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
      title: t('purchaseOrders.price'),
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
      title: t('purchaseOrders.discountPct'),
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
      title: t('purchaseOrders.taxRate'),
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
      title: t('purchaseOrders.lineTotal'),
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

  if (loading) return null;

  return (
    <div className="erpnext-form">
      <div className="erp-document-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => navigate('/purchase-orders')}
          />
          <h2>
            {isEdit ? order?.orderNumber || t('purchaseOrders.edit') : t('purchaseOrders.create')}
          </h2>
          {isEdit && (
            <span
              className="erp-status-badge"
              style={{
                backgroundColor: STATUS_BADGE_COLORS[status] + '1a',
                color: STATUS_BADGE_COLORS[status],
              }}
            >
              {t(`purchaseOrders.status_${status}`)}
            </span>
          )}
        </div>
      </div>

      <div className="erp-toolbar">
        <Space>
          {isEdit && (
            <Button icon={<PrinterOutlined />} disabled>
              {t('common.print')}
            </Button>
          )}
          <Button
            type="text"
            icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </Space>
        <Space>
          {(status === 'draft' || status === 'saved') && (
            <>
              {isEdit && (
                <Button
                  icon={<CheckOutlined />}
                  type="primary"
                  loading={saving}
                  onClick={() =>
                    Modal.confirm({ title: t('purchaseOrders.confirmSubmit'), onOk: handleSubmit })
                  }
                >
                  {t('purchaseOrders.submit')}
                </Button>
              )}
              <Button
                icon={<SaveOutlined />}
                type={status === 'draft' && !isEdit ? 'primary' : 'default'}
                loading={saving}
                onClick={handleSave}
              >
                {isEdit ? t('common.update') : t('common.save')}
              </Button>
              {isEdit && (
                <Popconfirm title={t('common.confirmDelete')} onConfirm={handleDelete}>
                  <Button danger icon={<DeleteOutlined />} loading={saving}>
                    {t('common.delete')}
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
          {status === 'confirmed' && (
            <Button
              danger
              icon={<CloseOutlined />}
              loading={saving}
              onClick={() =>
                Modal.confirm({
                  title: t('purchaseOrders.confirmCancelOrder'),
                  onOk: handleCancelOrder,
                })
              }
            >
              {t('purchaseOrders.cancelOrder')}
            </Button>
          )}
        </Space>
      </div>

      <div className="erp-form-body">
        <div className="erp-form-main">
          <div className="erp-section-body">
            <ErpFieldGrid>
              <ErpField label={t('purchaseOrders.supplier')} required>
                <Select
                  showSearch
                  placeholder={t('purchaseOrders.selectSupplier')}
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
              <ErpField label={t('purchaseOrders.orderDate')}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={orderDate}
                  onChange={(d) => d && setOrderDate(d)}
                />
              </ErpField>
              <ErpField label={t('purchaseOrders.expectedDate')}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={expectedDate}
                  onChange={(d) => setExpectedDate(d)}
                />
              </ErpField>
              <ErpField label={t('purchaseOrders.notes')} fullWidth>
                <Input.TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </ErpField>
            </ErpFieldGrid>
          </div>

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
                {t('purchaseOrders.lines')}
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
            {(status === 'draft' || status === 'saved') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addLine}>
                  {t('purchaseOrders.addLine')}
                </Button>
              </div>
            )}
          </div>

          <div className="erp-totals-block">
            <table className="erp-totals-table">
              <tbody>
                <tr>
                  <td>{t('purchaseOrders.subtotal')}</td>
                  <td>{formatted(subtotal)}</td>
                </tr>
                <tr>
                  <td>{t('purchaseOrders.discountTotal')}</td>
                  <td style={{ color: discountTotal ? '#dc2626' : undefined }}>
                    -{formatted(discountTotal)}
                  </td>
                </tr>
                <tr>
                  <td>{t('purchaseOrders.taxTotal')}</td>
                  <td>{formatted(taxTotal)}</td>
                </tr>
                <tr className="erp-grand-total">
                  <td>{t('purchaseOrders.total')}</td>
                  <td>{formatted(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={`erp-form-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
          <div className="erp-sidebar-tabs">
            {['activity', 'comments', 'files'].map((tab) => (
              <button
                key={tab}
                className={`erp-tab-btn${sidebarTab === tab ? ' active' : ''}`}
                onClick={() => setSidebarTab(tab)}
              >
                {t(`salesOrders.sidebar_${tab}`)}
              </button>
            ))}
          </div>
          <div className="erp-sidebar-content">
            {sidebarTab === 'activity' && <p>{t('common.noData')}</p>}
            {sidebarTab === 'comments' && <p>{t('common.noData')}</p>}
            {sidebarTab === 'files' && <p>{t('common.noData')}</p>}
          </div>
        </div>
      </div>

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
