import { useState, useCallback, useRef } from 'react';
import { Select, Empty, Button, Space } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export interface Many2OneOption {
  value: string;
  label: string;
}

interface Many2OneFieldProps {
  value?: string | null;
  onChange?: (value: string | null, option?: Many2OneOption) => void;
  onSearch?: (query: string) => Promise<Many2OneOption[]>;
  onCreateNew?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  options?: Many2OneOption[];
}

export function Many2OneField({
  value,
  onChange,
  onSearch,
  onCreateNew,
  placeholder,
  label,
  disabled = false,
  loading: externalLoading = false,
  options: defaultOptions = [],
}: Many2OneFieldProps) {
  const { t } = useTranslation();
  const [internalOptions, setInternalOptions] = useState<Many2OneOption[]>(defaultOptions);
  const [searching, setSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const options = internalOptions.length > 0 ? internalOptions : defaultOptions;

  const handleSearch = useCallback(
    (query: string) => {
      setSearchValue(query);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (!onSearch) return;
      debounceRef.current = setTimeout(async () => {
        if (query.length < 2) return;
        setSearching(true);
        try {
          const results = await onSearch(query);
          setInternalOptions(results);
        } finally {
          setSearching(false);
        }
      }, 300);
    },
    [onSearch],
  );

  const handleChange = (selectedValue: string) => {
    const selectedOption = options.find((opt) => opt.value === selectedValue);
    onChange?.(selectedValue || null, selectedOption);
  };

  const handleCreateNew = () => {
    if (searchValue && onCreateNew) {
      onCreateNew(searchValue);
    }
  };

  const notFoundContent = searchValue ? (
    <Space direction="vertical" style={{ padding: 8, width: '100%' }}>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.noResults')} />
      {onCreateNew && (
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleCreateNew} block>
          {t('common.createNew')}: {searchValue}
        </Button>
      )}
    </Space>
  ) : undefined;

  return (
    <Select
      showSearch
      allowClear
      value={value || undefined}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={placeholder || label}
      disabled={disabled}
      loading={externalLoading || searching}
      filterOption={false}
      notFoundContent={notFoundContent}
      getPopupContainer={() => document.body}
      suffixIcon={<SearchOutlined />}
      className="many2one-field"
      style={{ width: '100%' }}
      dropdownMatchSelectWidth={false}
      dropdownStyle={{ minWidth: 240 }}
    >
      {options.map((opt) => (
        <Select.Option key={opt.value} value={opt.value}>
          {opt.label}
        </Select.Option>
      ))}
    </Select>
  );
}
