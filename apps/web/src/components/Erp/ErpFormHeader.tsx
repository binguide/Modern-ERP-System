import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

interface ErpFormHeaderProps {
  title: string;
  subtitle?: string;
  status?: string;
  statusLabel?: string;
  isDirty?: boolean;
  onBack?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  extra?: React.ReactNode;
}

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#fffbeb', text: '#f59e0b' },
  saved: { bg: '#eff6ff', text: '#2490ef' },
  submitted: { bg: '#ecfdf5', text: '#10b981' },
  confirmed: { bg: '#ecfdf5', text: '#10b981' },
  cancelled: { bg: '#fef2f2', text: '#ef4444' },
  posted: { bg: '#ecfdf5', text: '#10b981' },
};

export function ErpFormHeader({
  title,
  subtitle,
  status,
  statusLabel,
  isDirty,
  onBack,
  onToggleSidebar,
  sidebarOpen,
  extra,
}: ErpFormHeaderProps) {
  const { t } = useTranslation();
  const statusColor = status ? STATUS_BADGE_COLORS[status] : undefined;

  return (
    <div className="erp-document-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {onBack && (
          <Button type="text" size="small" onClick={onBack}>
            ←
          </Button>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1a1a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h2>
            {status && statusColor && statusLabel && (
              <span
                className="erp-status-badge"
                style={{
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                  border: `1px solid ${statusColor.text}33`,
                }}
              >
                {statusLabel}
              </span>
            )}
            {isDirty && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 100,
                  background: '#fffbeb',
                  color: '#f59e0b',
                  border: '1px solid #f59e0b33',
                }}
              >
                ● {t('common.unsavedChanges')}
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: '#8d99a6', marginTop: 1 }}>{subtitle}</div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {extra}
        {onToggleSidebar && (
          <Button
            type="text"
            icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={onToggleSidebar}
          />
        )}
      </div>
    </div>
  );
}
