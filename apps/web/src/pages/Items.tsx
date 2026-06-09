import { useState } from 'react';
import {
  App,
  Modal,
  Image,
  Row,
  Col,
  Card as AntCard,
  Pagination,
  Spin,
  Button,
  Space,
  Tooltip,
} from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, PictureOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { itemsApi, ItemItem } from '@lib/api/endpoints/items';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function ImgPlaceholder({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PictureOutlined style={{ fontSize: size * 0.45, color: '#d9d9d9' }} />
    </div>
  );
}

export default function ItemsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const grid = useDataGrid<ItemItem>({
    fetchFn: (params) => itemsApi.findAll(params as Record<string, unknown>),
    storageKey: 'items-list-columns',
    columnKeys: [
      'imageUrl',
      'sku',
      'name',
      'type',
      'itemGroup',
      'costPrice',
      'sellingPrice',
      'reorderPoint',
      'defaultWarehouse',
    ],
  });

  const handleDeleteSelected = async (ids: string[]) => {
    Modal.confirm({
      title: t('common.confirmDelete'),
      onOk: async () => {
        for (const id of ids) {
          await itemsApi.remove(id);
        }
        message.success(t('common.deleted'));
        grid.clearSelection();
        grid.refresh();
      },
    });
  };

  const columns = [
    {
      title: '',
      key: 'imageUrl',
      width: 60,
      render: (_: unknown, r: ItemItem) =>
        r.imageUrl ? (
          <Image
            src={`${API_BASE}${r.imageUrl}`}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
            preview={false}
          />
        ) : (
          <ImgPlaceholder size={40} />
        ),
    },
    { title: t('items.sku'), key: 'sku', dataIndex: 'sku', sorter: true, width: 100 },
    { title: t('items.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    {
      title: t('items.type'),
      key: 'type',
      dataIndex: 'type',
      width: 100,
      render: (v: string) => t(`items.${v}`),
    },
    {
      title: t('items.itemGroup'),
      key: 'itemGroup',
      width: 120,
      render: (_: unknown, r: ItemItem) => r.itemGroup?.name || '-',
    },
    {
      title: t('items.costPrice'),
      key: 'costPrice',
      dataIndex: 'costPrice',
      sorter: true,
      width: 120,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: t('items.sellingPrice'),
      key: 'sellingPrice',
      dataIndex: 'sellingPrice',
      sorter: true,
      width: 120,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: t('items.reorderPoint'),
      key: 'reorderPoint',
      dataIndex: 'reorderPoint',
      sorter: true,
      width: 100,
      render: (v: number) => Number(v).toFixed(0),
    },
    {
      title: t('items.defaultWarehouse'),
      key: 'defaultWarehouse',
      width: 120,
      render: (_: unknown, r: ItemItem) => r.defaultWarehouse?.name || '-',
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      width: 100,
      render: (v: boolean) =>
        v ? (
          <OdooTag color="green">{t('common.active')}</OdooTag>
        ) : (
          <OdooTag color="red">{t('common.inactive')}</OdooTag>
        ),
    },
  ];

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'table' ? 'cards' : 'table'));
  };

  return (
    <DataGrid<ItemItem>
      {...grid}
      title={t('menu.items')}
      icon={<AppstoreOutlined />}
      columns={columns}
      columnLabels={[
        { key: 'imageUrl', label: t('items.imageUrl') },
        { key: 'sku', label: t('items.sku') },
        { key: 'name', label: t('items.name') },
        { key: 'type', label: t('items.type') },
        { key: 'itemGroup', label: t('items.itemGroup') },
        { key: 'costPrice', label: t('items.costPrice') },
        { key: 'sellingPrice', label: t('items.sellingPrice') },
        { key: 'reorderPoint', label: t('items.reorderPoint') },
        { key: 'defaultWarehouse', label: t('items.defaultWarehouse') },
        { key: 'isActive', label: t('common.status') },
      ]}
      basePath="items"
      onDeleteSelected={handleDeleteSelected}
      toolbarExtra={
        <Tooltip title={viewMode === 'table' ? t('items.cardView') : t('items.tableView')}>
          <Button
            icon={viewMode === 'table' ? <PictureOutlined /> : <UnorderedListOutlined />}
            onClick={toggleViewMode}
          />
        </Tooltip>
      }
    >
      {viewMode === 'cards' ? (
        <>
          {grid.loading ? (
            <Spin style={{ display: 'block', margin: '64px auto' }} />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {(grid.tableData as unknown as ItemItem[]).map((item) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <AntCard
                      hoverable
                      onClick={() => navigate(`/items/${item.id}/edit`)}
                      cover={
                        item.imageUrl ? (
                          <div style={{ height: 160, overflow: 'hidden' }}>
                            <Image
                              src={`${API_BASE}${item.imageUrl}`}
                              style={{ width: '100%', height: 160, objectFit: 'cover' }}
                              preview={false}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              height: 160,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#fafafa',
                            }}
                          >
                            <PictureOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                          </div>
                        )
                      }
                      style={{ borderRadius: 10 }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <AntCard.Meta
                        title={
                          <Space style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                            {item.name}
                          </Space>
                        }
                        description={
                          <div style={{ fontSize: 12, color: '#666' }}>
                            <div>
                              <strong>{t('items.sku')}:</strong> {item.sku}
                            </div>
                            <div>
                              <strong>{t('items.type')}:</strong> {t(`items.${item.type}`)}
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <strong>{t('items.sellingPrice')}:</strong>{' '}
                              <span style={{ color: '#52c41a', fontWeight: 600 }}>
                                {Number(item.sellingPrice).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ marginTop: 6 }}>
                              {item.isActive ? (
                                <OdooTag color="green">{t('common.active')}</OdooTag>
                              ) : (
                                <OdooTag color="red">{t('common.inactive')}</OdooTag>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </AntCard>
                  </Col>
                ))}
              </Row>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Pagination
                  current={grid.params.page}
                  pageSize={grid.params.limit}
                  total={grid.total}
                  showSizeChanger
                  pageSizeOptions={['10', '20', '50']}
                  onChange={(page, limit) => {
                    grid.setSelectedIds([]);
                    grid.setParams((prev) => ({ ...prev, page, limit }));
                  }}
                />
              </div>
            </>
          )}
        </>
      ) : null}
    </DataGrid>
  );
}
