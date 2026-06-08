import { Dropdown, Tooltip } from 'antd';
import { SettingOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';

interface ColumnDef {
  key: string;
  label: string;
}

interface GroupOption {
  value: string;
  label: string;
}

interface TableMenuProps {
  columns: ColumnDef[];
  visibleColumns: string[];
  onToggleColumn: (key: string) => void;
  onResetColumns: () => void;
  groupOptions?: GroupOption[];
  groupBy?: string[];
  onToggleGroup?: (field: string) => void;
}

export function TableMenu({
  columns,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
  groupOptions,
  groupBy,
  onToggleGroup,
}: TableMenuProps) {
  const { t } = useTranslation();

  const allVisible = columns.every((c) => visibleColumns.includes(c.key));

  const items: MenuProps['items'] = [];

  if (groupOptions && groupOptions.length > 0 && onToggleGroup) {
    items.push({
      key: '__group_header__',
      label: (
        <span style={{ fontWeight: 600, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
          {t('common.groupBy')}
        </span>
      ),
      disabled: true,
    });
    for (const o of groupOptions) {
      items.push({
        key: `group__${o.value}`,
        label: o.label,
        icon: groupBy?.includes(o.value) ? <CheckOutlined /> : <span style={{ width: 14 }} />,
      });
    }
    items.push({ type: 'divider' });
  }

  items.push({
    key: '__columns_header__',
    label: (
      <span style={{ fontWeight: 600, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
        {t('common.showHideColumns')}
      </span>
    ),
    disabled: true,
  });
  for (const col of columns) {
    items.push({
      key: `col__${col.key}`,
      label: col.label,
      icon: visibleColumns.includes(col.key) ? <CheckOutlined /> : <span style={{ width: 14 }} />,
    });
  }

  items.push({ type: 'divider' });
  items.push({
    key: '__reset__',
    label: t('common.reset'),
    disabled: allVisible,
  });

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    if (key === '__reset__') {
      onResetColumns();
      return;
    }
    if (key.startsWith('group__')) {
      onToggleGroup?.(key.replace('group__', ''));
      return;
    }
    if (key.startsWith('col__')) {
      onToggleColumn(key.replace('col__', ''));
      return;
    }
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={['click']}>
      <Tooltip title={t('common.showHideColumns')}>
        <span
          style={{
            cursor: 'pointer',
            padding: 6,
            borderRadius: '50%',
            fontSize: 18,
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.45)',
            transition: 'all 0.2s',
          }}
          className="table-menu-trigger"
        >
          <SettingOutlined />
        </span>
      </Tooltip>
    </Dropdown>
  );
}
