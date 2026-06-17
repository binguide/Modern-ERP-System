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
  UndoOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  salesOrdersApi,
  type SalesOrderItem,
  type SalesOrderStatus,
} from '@lib/api/endpoints/sales-orders';
import { customersApi, type CustomerItem } from '@lib/api/endpoints/customers';
import { unitsOfMeasureApi } from '@lib/api/endpoints/units-of-measure';
import { ItemSelector } from '@components/ItemSelector';

const STATUS_BADGE_COLORS: Record<SalesOrderStatus, string> = {
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
  price: number;
  discount: number;
  taxRate: number;
  total: number;
}

function createEmptyLine(): LineRow {
  return {
    _key: Math.random().toString(36).slice(2, 8),
    itemId: undefined,
    unit: undefined,
    quantity: 1,
    price: 0,
    discount: 0,
    taxRate: 0,
    total: 0,
  };
}

function calcLineTotal(qty: number, price: number, discount: number, taxRate: number): number {
  const lineTotal = qty * price;
  const discountAmt = lineTotal * (discount / 100);
  const taxable = lineTotal - discountAmt;
  const taxAmt = taxable * (taxRate / 100);
  return Math.round((taxable + taxAmt) * 100) / 100;
}

export default function SalesOrderFormPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<SalesOrderItem | null>(null);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);

  const [orderDate, setOrderDate] = useState(dayjs());
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [poNo, setPoNo] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<dayjs.Dayjs | null>(null);
  const [orderType, setOrderType] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [priceList, setPriceList] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [taxTemplate, setTaxTemplate] = useState('');
  const [debitTo, setDebitTo] = useState('');
  const [incomeAccount, setIncomeAccount] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [project, setProject] = useState('');
  const [territory, setTerritory] = useState('');
  const [salesPerson, setSalesPerson] = useState('');
  const [source, setSource] = useState('');
  const [campaign, setCampaign] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineRow[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ value: string; label: string }[]>([]);

  const [sectionTab, setSectionTab] = useState('details');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('activity');

  const [status, setStatus] = useState<SalesOrderStatus>('draft');

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (isDirty() || lines.length > 0) && currentLocation.pathname !== nextLocation.pathname,
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
    salesOrdersApi
      .findById(id)
      .then((o) => {
        setOrder(o);
        setOrderDate(dayjs(o.orderDate));
        setCustomerId(o.customerId);
        setPoNo(o.poNo || '');
        setDeliveryDate(o.deliveryDate ? dayjs(o.deliveryDate) : null);
        setOrderType(o.orderType || '');
        setShippingAddress(o.shippingAddress || '');
        setCurrency(o.currency || 'USD');
        setExchangeRate(o.exchangeRate || 1);
        setPriceList(o.priceList || '');
        setPaymentTerms(o.paymentTerms || '');
        setTaxTemplate(o.taxTemplate || '');
        setDebitTo(o.debitTo || '');
        setIncomeAccount(o.incomeAccount || '');
        setCostCenter(o.costCenter || '');
        setProject(o.project || '');
        setTerritory(o.territory || '');
        setSalesPerson(o.salesPerson || '');
        setSource(o.source || '');
        setCampaign(o.campaign || '');
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
              price: l.price,
              discount: l.discount,
              taxRate: l.taxRate,
              total: l.total,
            }),
          ),
        );
      })
      .catch(() => {
        message.error(t('errors.loadError'));
        navigate('/sales-orders');
      })
      .finally(() => setLoading(false));
  }, [id, message, t, navigate]);

  function isDirty() {
    return false;
  }

  function recalcLine(index: number) {
    setLines((prev) => {
      const next = [...prev];
      const l = next[index];
      if (!l) return prev;
      next[index] = {
        ...l,
        total: calcLineTotal(
          Number(l.quantity) || 0,
          Number(l.price) || 0,
          Number(l.discount) || 0,
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

  const subtotal = lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.price) || 0),
    0,
  );
  const discountTotal = lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.price) || 0) * ((l.discount || 0) / 100),
    0,
  );
  const taxTotal = lines.reduce((s, l) => {
    const lineTotal = (Number(l.quantity) || 0) * (Number(l.price) || 0);
    const discAmt = lineTotal * ((l.discount || 0) / 100);
    return s + (lineTotal - discAmt) * ((l.taxRate || 0) / 100);
  }, 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const formatted = (v: number) =>
    v.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function buildPayload() {
    return {
      orderDate: orderDate.format('YYYY-MM-DD'),
      customerId: customerId!,
      poNo: poNo || undefined,
      deliveryDate: deliveryDate ? deliveryDate.format('YYYY-MM-DD') : undefined,
      orderType: orderType || undefined,
      shippingAddress: shippingAddress || undefined,
      currency,
      exchangeRate,
      priceList: priceList || undefined,
      paymentTerms: paymentTerms || undefined,
      taxTemplate: taxTemplate || undefined,
      debitTo: debitTo || undefined,
      incomeAccount: incomeAccount || undefined,
      costCenter: costCenter || undefined,
      project: project || undefined,
      territory: territory || undefined,
      salesPerson: salesPerson || undefined,
      source: source || undefined,
      campaign: campaign || undefined,
      notes: notes || undefined,
      lines: lines.map((l) => ({
        itemId: l.itemId || undefined,
        unit: l.unit || undefined,
        quantity: Number(l.quantity),
        price: Number(l.price),
        discount: Number(l.discount || 0),
        taxRate: Number(l.taxRate || 0),
      })),
    };
  }

  async function handleSave() {
    if (!customerId) {
      message.error(t('validation.required', { field: t('salesOrders.customer') }));
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await salesOrdersApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        await salesOrdersApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/sales-orders');
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
      await salesOrdersApi.submit(id);
      message.success(t('common.updated'));
      navigate('/sales-orders');
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
      await salesOrdersApi.cancel(id);
      message.success(t('common.updated'));
      navigate('/sales-orders');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleAmend() {
    if (!id) return;
    setSaving(true);
    try {
      await salesOrdersApi.amend(id);
      message.success(t('common.created'));
      navigate('/sales-orders');
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
      await salesOrdersApi.remove(id);
      message.success(t('common.deleted'));
      navigate('/sales-orders');
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
      dataIndex: 'itemId',
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
      dataIndex: 'unit',
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
      title: t('salesOrders.quantity'),
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
      title: t('salesOrders.price'),
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          precision={2}
          value={lines[index]?.price}
          onChange={(v) => updateLine(index, 'price', v)}
        />
      ),
    },
    {
      title: t('salesOrders.discountPct'),
      dataIndex: 'discount',
      key: 'discount',
      width: 90,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          max={100}
          precision={2}
          value={lines[index]?.discount}
          onChange={(v) => updateLine(index, 'discount', v)}
        />
      ),
    },
    {
      title: t('salesOrders.taxRate'),
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
      title: t('salesOrders.lineTotal'),
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ fontWeight: 500 }}>{formatted(lines[index]?.total || 0)}</span>
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

  function renderSectionTab(id: string, label: string) {
    return (
      <button
        key={id}
        className={`erp-tab-btn${sectionTab === id ? ' active' : ''}`}
        onClick={() => setSectionTab(id)}
      >
        {label}
      </button>
    );
  }

  const sectionTabs = [
    { id: 'details', label: t('salesOrders.section_details') },
    { id: 'pricing', label: t('salesOrders.section_pricing') },
    { id: 'accounting', label: t('salesOrders.section_accounting') },
    { id: 'moreInfo', label: t('salesOrders.section_more_info') },
  ];

  if (loading) return null;

  return (
    <div className="erpnext-form">
      {/* Document Header */}
      <div className="erp-document-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button type="text" icon={<CloseOutlined />} onClick={() => navigate('/sales-orders')} />
          <h2>{isEdit ? order?.orderNumber || t('salesOrders.edit') : t('salesOrders.create')}</h2>
          {isEdit && (
            <span
              className="erp-status-badge"
              style={{
                backgroundColor: STATUS_BADGE_COLORS[status] + '1a',
                color: STATUS_BADGE_COLORS[status],
              }}
            >
              {t(`salesOrders.status_${status}`)}
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
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
                    Modal.confirm({
                      title: t('salesOrders.confirmSubmit'),
                      onOk: handleSubmit,
                    })
                  }
                >
                  {t('salesOrders.submit')}
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
                  title: t('salesOrders.confirmCancelOrder'),
                  onOk: handleCancelOrder,
                })
              }
            >
              {t('salesOrders.cancelOrder')}
            </Button>
          )}
          {status === 'cancelled' && (
            <Button
              icon={<UndoOutlined />}
              loading={saving}
              onClick={() =>
                Modal.confirm({
                  title: t('salesOrders.confirmAmend'),
                  onOk: handleAmend,
                })
              }
            >
              {t('salesOrders.amend')}
            </Button>
          )}
        </Space>
      </div>

      {/* Form Body */}
      <div className="erp-form-body">
        {/* Main Content */}
        <div className="erp-form-main">
          {/* Section Tabs */}
          <div className="erp-section-tabs">
            {sectionTabs.map((tab) => renderSectionTab(tab.id, tab.label))}
          </div>

          {/* Section Content */}
          {sectionTab === 'details' && (
            <div className="erp-section-body">
              <div className="erp-field-grid">
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.customer')}</label>
                    </div>
                    <Select
                      showSearch
                      placeholder={t('salesOrders.selectCustomer')}
                      optionFilterProp="label"
                      style={{ width: '100%' }}
                      value={customerId}
                      onChange={setCustomerId}
                      options={customers.map((c) => ({
                        value: c.id,
                        label: `${c.code} - ${c.name}`,
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.orderDate')}</label>
                    </div>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={orderDate}
                      onChange={(d) => d && setOrderDate(d)}
                    />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.poNo')}</label>
                    </div>
                    <Input value={poNo} onChange={(e) => setPoNo(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.deliveryDate')}</label>
                    </div>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={deliveryDate}
                      onChange={(d) => setDeliveryDate(d)}
                    />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.orderType')}</label>
                    </div>
                    <Input value={orderType} onChange={(e) => setOrderType(e.target.value)} />
                  </div>
                </div>
                <div className="erp-field-full">
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.shippingAddress')}</label>
                    </div>
                    <Input.TextArea
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="erp-field-full">
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.notes')}</label>
                    </div>
                    <Input.TextArea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {sectionTab === 'pricing' && (
            <div className="erp-section-body">
              <div className="erp-field-grid">
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.currency')}</label>
                    </div>
                    <Select
                      style={{ width: '100%' }}
                      value={currency}
                      onChange={setCurrency}
                      options={[
                        { value: 'USD', label: 'USD' },
                        { value: 'EUR', label: 'EUR' },
                        { value: 'SAR', label: 'SAR' },
                        { value: 'AED', label: 'AED' },
                      ]}
                    />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.exchangeRate')}</label>
                    </div>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={6}
                      value={exchangeRate}
                      onChange={(v) => setExchangeRate(Number(v) || 1)}
                    />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.priceList')}</label>
                    </div>
                    <Input value={priceList} onChange={(e) => setPriceList(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.paymentTerms')}</label>
                    </div>
                    <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {sectionTab === 'accounting' && (
            <div className="erp-section-body">
              <div className="erp-field-grid">
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.taxTemplate')}</label>
                    </div>
                    <Input value={taxTemplate} onChange={(e) => setTaxTemplate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.debitTo')}</label>
                    </div>
                    <Input value={debitTo} onChange={(e) => setDebitTo(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.incomeAccount')}</label>
                    </div>
                    <Input
                      value={incomeAccount}
                      onChange={(e) => setIncomeAccount(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.costCenter')}</label>
                    </div>
                    <Input value={costCenter} onChange={(e) => setCostCenter(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {sectionTab === 'moreInfo' && (
            <div className="erp-section-body">
              <div className="erp-field-grid">
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.project')}</label>
                    </div>
                    <Input value={project} onChange={(e) => setProject(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.territory')}</label>
                    </div>
                    <Input value={territory} onChange={(e) => setTerritory(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.salesPerson')}</label>
                    </div>
                    <Input value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.source')}</label>
                    </div>
                    <Input value={source} onChange={(e) => setSource(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="ant-form-item">
                    <div className="ant-form-item-label">
                      <label>{t('salesOrders.campaign')}</label>
                    </div>
                    <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
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
                {t('salesOrders.lines')}
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
                  {t('salesOrders.addLine')}
                </Button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="erp-totals-block">
            <table className="erp-totals-table">
              <tbody>
                <tr>
                  <td>{t('salesOrders.subtotal')}</td>
                  <td>{formatted(subtotal)}</td>
                </tr>
                <tr>
                  <td>{t('salesOrders.discountTotal')}</td>
                  <td style={{ color: discountTotal ? '#dc2626' : undefined }}>
                    -{formatted(discountTotal)}
                  </td>
                </tr>
                <tr>
                  <td>{t('salesOrders.taxTotal')}</td>
                  <td>{formatted(taxTotal)}</td>
                </tr>
                <tr className="erp-grand-total">
                  <td>{t('salesOrders.total')}</td>
                  <td>{formatted(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
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

      {/* Unsaved changes blocker */}
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
