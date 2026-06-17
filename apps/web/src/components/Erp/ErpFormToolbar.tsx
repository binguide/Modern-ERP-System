import { Button, Space, Tooltip } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  CheckOutlined,
  UndoOutlined,
  PrinterOutlined,
  MailOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ErpFormToolbarProps {
  status?: 'draft' | 'saved' | 'confirmed' | 'submitted' | 'posted' | 'cancelled';
  isDirty?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  onSubmit?: () => void;
  onCancelOrder?: () => void;
  onAmend?: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
  extra?: React.ReactNode;
}

export function ErpFormToolbar({
  status = 'draft',
  isDirty = false,
  saving = false,
  onSave,
  onDiscard,
  onSubmit,
  onCancelOrder,
  onAmend,
  onPrint,
  onEmail,
  extra,
}: ErpFormToolbarProps) {
  const { t } = useTranslation();

  const isSubmitted = status === 'confirmed' || status === 'submitted' || status === 'posted';
  const isCancelled = status === 'cancelled';
  const isSaved = status === 'saved';
  const isDraft = status === 'draft';

  const showSave = onSave && (isDraft || (isSaved && isDirty) || isDirty);
  const showSubmit = onSubmit && isSaved && !isDirty;
  const showCancel = onCancelOrder && isSubmitted;
  const showAmend = onAmend && isCancelled;
  const showDiscard = onDiscard && isDirty;

  return (
    <div className="erp-toolbar">
      <Space>
        {onPrint && (
          <Tooltip title={t('common.print')}>
            <Button icon={<PrinterOutlined />} size="small" disabled={saving} onClick={onPrint} />
          </Tooltip>
        )}
        {onEmail && (
          <Tooltip title="Email">
            <Button icon={<MailOutlined />} size="small" disabled={saving} onClick={onEmail} />
          </Tooltip>
        )}
        <Tooltip title={t('common.actions')}>
          <Button icon={<EllipsisOutlined />} size="small" disabled={saving} />
        </Tooltip>
        {extra}
      </Space>
      <Space>
        {showAmend && (
          <Button
            icon={<UndoOutlined />}
            style={{ background: '#8b5cf6', color: '#fff', border: 'none' }}
            loading={saving}
            onClick={onAmend}
          >
            {t('salesOrders.amend')}
          </Button>
        )}
        {showCancel && (
          <Button icon={<CloseOutlined />} danger loading={saving} onClick={onCancelOrder}>
            {t('salesOrders.cancelOrder')}
          </Button>
        )}
        {showSubmit && (
          <Button
            icon={<CheckOutlined />}
            style={{ background: '#10b981', color: '#fff', border: 'none' }}
            loading={saving}
            onClick={onSubmit}
          >
            {t('salesOrders.submit')}
          </Button>
        )}
        {showSave && (
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>
            {isDraft && !isDirty ? t('common.save') : t('common.update')}
          </Button>
        )}
        {showDiscard && (
          <Button icon={<CloseOutlined />} disabled={saving} onClick={onDiscard}>
            {t('common.cancel')}
          </Button>
        )}
      </Space>
    </div>
  );
}
