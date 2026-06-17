import { type ReactNode, useState, useCallback } from 'react';
import { Button, Table, Input, InputNumber, type TableProps } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { AnyObject } from 'antd/es/_util/type';

interface ErpEditableTableProps<T extends AnyObject> {
  value: T[];
  columns: TableProps<T>['columns'];
  onAddRow?: () => void;
  canEdit?: boolean;
  rowKey?: string;
  summary?: ReactNode;
  emptyText?: string;
  addRowLabel?: string;
  scroll?: { x?: number; y?: number };
}

export function ErpEditableTable<T extends AnyObject>({
  value,
  columns,
  onAddRow,
  canEdit = true,
  rowKey = '_key',
  summary,
  emptyText,
  addRowLabel,
  scroll,
}: ErpEditableTableProps<T>) {
  const { t } = useTranslation();

  const cols = columns ? [...columns] : [];

  return (
    <div className="erp-items-table">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#36414c' }}>
          {t('salesOrders.lines')}
        </span>
        {value.length > 0 && (
          <span style={{ fontSize: 12, color: '#8d99a6' }}>
            {value.length} {t('common.rows')}
          </span>
        )}
      </div>
      <Table<T>
        dataSource={value}
        columns={cols}
        rowKey={rowKey}
        pagination={false}
        size="small"
        bordered={false}
        scroll={scroll}
        locale={{ emptyText: emptyText || t('common.noData') }}
        summary={summary ? () => <Table.Summary>{summary}</Table.Summary> : undefined}
      />
      {canEdit && onAddRow && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={onAddRow}
            style={{ borderColor: '#2490ef', color: '#2490ef' }}
          >
            {addRowLabel || t('salesOrders.addLine')}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ErpEditableCellProps {
  value: string | number | undefined | null;
  onChange: (value: string | number | null) => void;
  type?: 'text' | 'number';
  precision?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  readOnly?: boolean;
}

export function ErpEditableCell({
  value,
  onChange,
  type = 'text',
  precision,
  min,
  max,
  placeholder,
  readOnly = false,
}: ErpEditableCellProps) {
  const [focused, setFocused] = useState(false);
  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  if (readOnly) {
    return <span style={{ fontWeight: 500 }}>{value ?? '-'}</span>;
  }

  const borderStyle: React.CSSProperties = focused
    ? {
        border: '1.5px solid #2490ef',
        borderRadius: 4,
        boxShadow: '0 0 0 2px rgba(36, 144, 239, 0.12)',
        transition: 'border-color 0.2s',
      }
    : { border: '1.5px solid transparent', borderRadius: 4, transition: 'border-color 0.2s' };

  if (type === 'number') {
    return (
      <div style={borderStyle}>
        <InputNumber
          size="small"
          variant="borderless"
          min={min}
          max={max}
          precision={precision}
          value={value as number}
          onChange={(v) => onChange(v ?? null)}
          placeholder={placeholder}
          style={{ width: '100%' }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    );
  }

  return (
    <div style={borderStyle}>
      <Input
        size="small"
        variant="borderless"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

interface ErpDeleteCellProps {
  onDelete: () => void;
  visible?: boolean;
}

export function ErpDeleteCell({ onDelete, visible = false }: ErpDeleteCellProps) {
  if (!visible) return null;
  return (
    <Button
      type="text"
      size="small"
      className="erp-delete-line-btn"
      icon={<CloseOutlined style={{ fontSize: 12 }} />}
      onClick={onDelete}
    />
  );
}
