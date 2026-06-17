import { useState, useEffect, useCallback } from 'react';
import { Input, Modal, List, Typography, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { itemsApi, type ItemItem, type QueryItemsParams } from '@lib/api/endpoints/items';
import { itemGroupsApi, type ItemGroupItem } from '@lib/api/endpoints/item-groups';

interface ItemSelectorProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
}

export function ItemSelector({ value, onChange, disabled }: ItemSelectorProps) {
  const { t } = useTranslation();
  const [itemLabel, setItemLabel] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (value) {
      itemsApi
        .findById(value)
        .then((item) => {
          setItemLabel(`${item.sku} - ${item.name}`);
        })
        .catch(() => setItemLabel(''));
    } else {
      setItemLabel('');
    }
  }, [value]);

  return (
    <>
      <Input
        size="small"
        variant="borderless"
        readOnly
        placeholder={t('common.searchItem')}
        value={itemLabel}
        onClick={() => !disabled && setDialogOpen(true)}
        suffix={<SearchOutlined style={{ color: '#9ca3af', fontSize: 12 }} />}
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      />
      <ItemSelectorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={(id) => {
          onChange?.(id);
          setDialogOpen(false);
        }}
      />
    </>
  );
}

interface ItemSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (itemId: string) => void;
}

function ItemSelectorDialog({ open, onClose, onSelect }: ItemSelectorDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<ItemGroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [items, setItems] = useState<ItemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedGroupId(null);
      return;
    }
    setGroupsLoading(true);
    itemGroupsApi
      .findAll({ limit: 999 })
      .then((res) => setGroups(res.data))
      .catch(() => setGroups([]))
      .finally(() => setGroupsLoading(false));
  }, [open]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: QueryItemsParams = { limit: 50 };
      if (selectedGroupId) params.itemGroupId = selectedGroupId;
      if (search) params.search = search;
      const res = await itemsApi.findAll(params);
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId, search]);

  useEffect(() => {
    if (open) loadItems();
  }, [open, loadItems]);

  return (
    <Modal
      title={t('common.searchItem')}
      open={open}
      onCancel={onClose}
      width={680}
      footer={null}
      destroyOnClose
    >
      <Input
        placeholder={t('common.search')}
        prefix={<SearchOutlined />}
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: 'flex', gap: 16, minHeight: 320 }}>
        <div
          style={{ width: 170, borderRight: '1px solid #e5e7eb', flexShrink: 0, overflowY: 'auto' }}
        >
          {groupsLoading ? (
            <Spin size="small" style={{ display: 'block', margin: '16px auto' }} />
          ) : (
            <>
              <div
                onClick={() => setSelectedGroupId(null)}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: selectedGroupId === null ? 600 : 400,
                  background: selectedGroupId === null ? '#f3f4f6' : 'transparent',
                  borderRadius: 4,
                  marginBottom: 2,
                }}
              >
                {t('common.all')}
              </div>
              {groups.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: selectedGroupId === g.id ? 600 : 400,
                    background: selectedGroupId === g.id ? '#f3f4f6' : 'transparent',
                    borderRadius: 4,
                    marginBottom: 2,
                  }}
                >
                  {g.code} — {g.name}
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <Spin style={{ display: 'block', margin: '40px auto' }} />
          ) : items.length === 0 ? (
            <Empty description={t('common.noData')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  onClick={() => onSelect(item.id)}
                  style={{ cursor: 'pointer', padding: '8px 12px' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <Typography.Text strong style={{ fontSize: 13 }}>
                        {item.sku}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        {item.name}
                      </Typography.Text>
                    </div>
                    <Typography.Text style={{ fontSize: 11, color: '#9ca3af' }}>
                      {item.type === 'product' ? t('items.product') : t('items.service')}
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
