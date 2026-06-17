import { useEffect, useState } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Input, InputNumber, Select, DatePicker, App, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { journalEntriesApi, type JournalEntryItem } from '@lib/api/endpoints/journal-entries';
import { fiscalYearsApi, type FiscalYearItem } from '@lib/api/endpoints/fiscal-years';
import { periodsApi, type PeriodItem } from '@lib/api/endpoints/periods';
import { accountsApi, type AccountItem } from '@lib/api/endpoints/accounts';
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
  accountId: string;
  debit: number;
  credit: number;
}

function createEmptyLine(): LineRow {
  return { _key: Math.random().toString(36).slice(2, 8), accountId: '', debit: 0, credit: 0 };
}

export default function JournalEntryFormPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState<JournalEntryItem | null>(null);

  const [entryDate, setEntryDate] = useState(dayjs());
  const [fiscalYearId, setFiscalYearId] = useState<string | undefined>();
  const [periodId, setPeriodId] = useState<string | undefined>();
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<LineRow[]>([createEmptyLine(), createEmptyLine()]);

  const [fiscalYears, setFiscalYears] = useState<FiscalYearItem[]>([]);
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [status, setStatus] = useState('draft');
  const [entryNumber, setEntryNumber] = useState<number | null>(null);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname,
  );

  const isReadOnly = status === 'posted' || status === 'cancelled';

  useEffect(() => {
    Promise.all([fiscalYearsApi.findAll({ limit: 100 }), accountsApi.findAll()]).then(
      ([fyRes, accRes]) => {
        setFiscalYears(fyRes.data);
        setAccounts(accRes);
      },
    );
  }, []);

  useEffect(() => {
    if (!fiscalYearId) {
      setPeriods([]);
      return;
    }
    periodsApi
      .findAll({ fiscalYearId, limit: 100 })
      .then((res) => setPeriods(res.data))
      .catch(() => setPeriods([]));
  }, [fiscalYearId]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    journalEntriesApi
      .findById(id)
      .then((e) => {
        setEntry(e);
        setEntryDate(dayjs(e.date));
        setFiscalYearId(e.fiscalYearId);
        setPeriodId(e.periodId);
        setReference(e.reference || '');
        setDescription(e.description || '');
        setStatus(e.status);
        setEntryNumber(e.number);
        if (e.fiscalYearId) {
          periodsApi
            .findAll({ fiscalYearId: e.fiscalYearId, limit: 100 })
            .then((res) => setPeriods(res.data))
            .catch(() => {});
        }
        setLines(
          (e.lines || []).map(
            (l): LineRow => ({
              _key: Math.random().toString(36).slice(2, 8),
              accountId: l.accountId,
              debit: Number(l.debit),
              credit: Number(l.credit),
            }),
          ),
        );
      })
      .catch(() => {
        message.error(t('errors.loadError'));
        navigate('/journal-entries');
      })
      .finally(() => setLoading(false));
  }, [id, message, t, navigate]);

  function updateLine(index: number, field: string, value: string | number | null) {
    setLines((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value ?? (field === 'debit' || field === 'credit' ? 0 : ''),
      } as LineRow;
      return next;
    });
  }

  function addLine() {
    setLines((prev) => [...prev, createEmptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const difference = totalDebit - totalCredit;
  const isBalanced = Math.abs(difference) < 0.01;

  const formatted = (v: number) =>
    v.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const accountOptions = accounts
    .filter((a) => a.isActive)
    .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));

  const lineColumns = [
    {
      title: t('journalEntries.account'),
      key: 'account',
      width: 300,
      render: (_: unknown, __: unknown, index: number) => (
        <Select
          style={{ width: '100%' }}
          showSearch
          size="small"
          variant="borderless"
          value={lines[index]?.accountId || undefined}
          onChange={(v) => updateLine(index, 'accountId', v)}
          options={accountOptions}
          placeholder={t('journalEntries.account')}
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: t('journalEntries.debit'),
      key: 'debit',
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          precision={2}
          value={lines[index]?.debit}
          onChange={(v) => updateLine(index, 'debit', v)}
        />
      ),
    },
    {
      title: t('journalEntries.credit'),
      key: 'credit',
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          size="small"
          variant="borderless"
          min={0}
          precision={2}
          value={lines[index]?.credit}
          onChange={(v) => updateLine(index, 'credit', v)}
        />
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

  function buildPayload() {
    return {
      date: entryDate.format('YYYY-MM-DD'),
      description: description || undefined,
      fiscalYearId: fiscalYearId!,
      periodId: periodId!,
      reference: reference || undefined,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
      })),
    };
  }

  async function handleSave() {
    if (!fiscalYearId) {
      message.error(t('validation.required', { field: t('journalEntries.fiscalYear') }));
      return;
    }
    if (!periodId) {
      message.error(t('validation.required', { field: t('journalEntries.period') }));
      return;
    }
    if (!isBalanced) {
      message.error(t('journalEntries.unbalanced'));
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await journalEntriesApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        await journalEntriesApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/journal-entries');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePost() {
    if (!id) return;
    setSaving(true);
    try {
      await journalEntriesApi.post(id);
      message.success(t('common.updated'));
      navigate('/journal-entries');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelEntry() {
    if (!id) return;
    setSaving(true);
    try {
      await journalEntriesApi.cancel(id);
      message.success(t('common.updated'));
      navigate('/journal-entries');
    } catch {
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  const differenceColor = !isBalanced ? '#dc2626' : '#16a34a';

  const totalsBlock = (
    <div className="erp-totals-block">
      <table className="erp-totals-table">
        <tbody>
          <tr>
            <td>{t('journalEntries.totalDebit')}</td>
            <td>{formatted(totalDebit)}</td>
          </tr>
          <tr>
            <td>{t('journalEntries.totalCredit')}</td>
            <td>{formatted(totalCredit)}</td>
          </tr>
          <tr className="erp-grand-total">
            <td>{t('journalEntries.difference')}</td>
            <td style={{ color: differenceColor }}>{formatted(Math.abs(difference))}</td>
          </tr>
        </tbody>
      </table>
      {!isReadOnly && !isBalanced && (
        <div style={{ padding: '4px 16px 0', fontSize: 12, color: '#dc2626' }}>
          {t('journalEntries.unbalanced')}
        </div>
      )}
    </div>
  );

  if (loading) return null;

  const toolbarStatus: 'draft' | 'submitted' | 'cancelled' =
    status === 'posted' ? 'submitted' : status === 'cancelled' ? 'cancelled' : 'draft';

  return (
    <div className="erpnext-form">
      <ErpFormHeader
        title={isEdit ? `#${entryNumber}` || t('journalEntries.edit') : t('journalEntries.create')}
        status={isEdit ? status : undefined}
        statusLabel={isEdit ? t(`journalEntries.${status}`) : undefined}
        isDirty={false}
        onBack={() => navigate('/journal-entries')}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />

      <ErpFormToolbar
        status={toolbarStatus}
        saving={saving}
        onSave={handleSave}
        onSubmit={isEdit ? handlePost : undefined}
        onCancelOrder={isEdit ? handleCancelEntry : undefined}
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
                      {t('common.status')}: {t(`journalEntries.${status}`)}
                    </p>
                    {entry?.date && (
                      <p>
                        {t('journalEntries.date')}: {dayjs(entry.date).format('YYYY-MM-DD')}
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
          activeKey="details"
          onChange={() => {}}
        >
          <ErpFieldGrid>
            <ErpField label={t('journalEntries.date')} required>
              <DatePicker
                style={{ width: '100%' }}
                value={entryDate}
                onChange={(d) => d && setEntryDate(d)}
              />
            </ErpField>
            <ErpField label={t('journalEntries.fiscalYear')} required>
              <Select
                style={{ width: '100%' }}
                value={fiscalYearId}
                onChange={(v) => {
                  setFiscalYearId(v);
                  setPeriodId(undefined);
                }}
                options={fiscalYears.map((fy) => ({ value: fy.id, label: fy.code }))}
              />
            </ErpField>
            <ErpField label={t('journalEntries.period')} required>
              <Select
                style={{ width: '100%' }}
                disabled={!fiscalYearId}
                value={periodId}
                onChange={setPeriodId}
                options={periods.map((p) => ({ value: p.id, label: p.name }))}
              />
            </ErpField>
            <ErpField label={t('journalEntries.reference')}>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </ErpField>
            <ErpField label={t('journalEntries.description')} fullWidth>
              <Input.TextArea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </ErpField>
          </ErpFieldGrid>

          <ErpEditableTable
            value={lines}
            columns={lineColumns}
            rowKey="_key"
            canEdit={!isReadOnly}
            onAddRow={addLine}
          />
        </ErpFormTabs>

        {totalsBlock}
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
