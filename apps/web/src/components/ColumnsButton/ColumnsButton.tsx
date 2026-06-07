import { Dropdown, Button } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ColumnDef {
  key: string;
  label: string;
}

interface ColumnsButtonProps {
  columns: ColumnDef[];
  visibleColumns: string[];
  onToggle: (key: string) => void;
  onReset: () => void;
}

export function ColumnsButton({ columns, visibleColumns, onToggle, onReset }: ColumnsButtonProps) {
  const { t } = useTranslation();

  const allVisible = columns.every((c) => visibleColumns.includes(c.key));

  return (
    <Dropdown
      menu={{
        items: [
          ...columns.map((col) => ({
            key: col.key,
            label: col.label,
            icon: (
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  color: visibleColumns.includes(col.key) ? '#1677ff' : 'transparent',
                }}
              >
                ✓
              </span>
            ),
          })),
          { type: 'divider' as const },
          {
            key: '__reset__',
            label: t('common.reset'),
            disabled: allVisible,
          },
        ],
        onClick: ({ key }) => {
          if (key === '__reset__') onReset();
          else onToggle(key);
        },
      }}
      trigger={['click']}
    >
      <Button icon={<TableOutlined />}>{t('common.columns')}</Button>
    </Dropdown>
  );
}
