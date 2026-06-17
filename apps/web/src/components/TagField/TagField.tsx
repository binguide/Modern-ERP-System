import { useState } from 'react';
import { Select, Tag, Space } from 'antd';
import type { SelectProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface TagOption {
  value: string;
  label: string;
  color?: string;
}

interface TagFieldProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options?: TagOption[];
  placeholder?: string;
  allowCreate?: boolean;
  maxTagCount?: number;
  disabled?: boolean;
}

export function TagField({
  value = [],
  onChange,
  options = [],
  placeholder,
  allowCreate = true,
  maxTagCount = 3,
  disabled = false,
}: TagFieldProps) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const handleChange = (selectedValues: string[]) => {
    onChange?.(selectedValues);
  };

  const filteredOptions = options.filter((opt) => !value.includes(opt.value));

  const tagRender: SelectProps['tagRender'] = (props) => {
    const { label, value: tagValue, closable, onClose } = props;
    const option = options.find((opt) => opt.value === tagValue);
    return (
      <Tag
        color={option?.color || 'blue'}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 4 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <Select
      mode="tags"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      tagRender={tagRender}
      maxTagCount={maxTagCount}
      onSearch={setSearchValue}
      searchValue={searchValue}
      onBlur={() => setSearchValue('')}
      style={{ width: '100%' }}
      dropdownRender={(menu) => (
        <div>
          {allowCreate && searchValue && !options.some((opt) => opt.value === searchValue) && (
            <div
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#2563eb',
                borderBottom: '1px solid #f3f4f6',
              }}
              onClick={() => {
                handleChange([...value, searchValue]);
                setSearchValue('');
              }}
            >
              <PlusOutlined style={{ marginRight: 8 }} />
              {t('common.createNew')}: {searchValue}
            </div>
          )}
          {menu}
        </div>
      )}
    >
      {filteredOptions.map((opt) => (
        <Select.Option key={opt.value} value={opt.value}>
          <Space>
            {opt.label}
            {opt.color && (
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: opt.color,
                }}
              />
            )}
          </Space>
        </Select.Option>
      ))}
    </Select>
  );
}
