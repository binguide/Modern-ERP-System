import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Switch,
  Space,
  App,
  Spin,
  Divider,
  Typography,
  Row,
  Col,
  Table,
  Upload,
  Image,
} from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  UploadOutlined,
  LoadingOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  itemsApi,
  CreateItemPayload,
  UpdateItemPayload,
  ItemUnitItem,
} from '@lib/api/endpoints/items';
import { warehousesApi, WarehouseItem } from '@lib/api/endpoints/warehouses';
import { itemGroupsApi, ItemGroupItem } from '@lib/api/endpoints/item-groups';
import { unitsOfMeasureApi, UnitOfMeasureItem } from '@lib/api/endpoints/units-of-measure';
import { uploadApi } from '@lib/api/endpoints/upload';

const { Title } = Typography;

export default function ItemFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroupItem[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureItem[]>([]);
  const [unitRows, setUnitRows] = useState<ItemUnitItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const currentImage = Form.useWatch('imageUrl', form);
  const isEdit = Boolean(id);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [whData, grpData, uomData] = await Promise.all([
          warehousesApi.findAll({ page: 1, limit: 999 }),
          itemGroupsApi.findAll({ page: 1, limit: 999 }),
          unitsOfMeasureApi.findAll({ page: 1, limit: 999 }),
        ]);
        setWarehouses(whData.data);
        setItemGroups(grpData.data);
        setUnitsOfMeasure(uomData.data);

        if (id) {
          const item = await itemsApi.findById(id);
          form.setFieldsValue({
            sku: item.sku,
            name: item.name,
            description: item.description || '',
            type: item.type,
            costPrice: Number(item.costPrice),
            sellingPrice: Number(item.sellingPrice),
            itemGroupId: item.itemGroupId || undefined,
            imageUrl: item.imageUrl || '',
            reorderPoint: Number(item.reorderPoint),
            reorderQuantity: Number(item.reorderQuantity),
            defaultWarehouseId: item.defaultWarehouseId || undefined,
            isActive: item.isActive,
          });
          setUnitRows(item.units || []);
        }
      } catch {
        message.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id, form, message, t]);

  const addUnitRow = () => {
    setUnitRows((prev) => [
      ...prev,
      {
        id: `new_${Date.now()}`,
        unitId: '',
        conversionRate: 1,
        barcode: '',
        costPrice: 0,
        sellingPrice: 0,
        isDefault: prev.length === 0,
      } as ItemUnitItem,
    ]);
  };

  const removeUnitRow = (index: number) => {
    setUnitRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateUnitRow = (index: number, field: string, value: unknown) => {
    setUnitRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const payload = {
        sku: values.sku as string,
        name: values.name as string,
        description: (values.description as string) || undefined,
        type: values.type as 'product' | 'service',
        costPrice: values.costPrice as number,
        sellingPrice: values.sellingPrice as number,
        itemGroupId: (values.itemGroupId as string) || undefined,
        imageUrl: (values.imageUrl as string) || undefined,
        reorderPoint: (values.reorderPoint as number) || 0,
        reorderQuantity: (values.reorderQuantity as number) || 0,
        defaultWarehouseId: (values.defaultWarehouseId as string) || undefined,
        units: unitRows.map((r) => ({
          unitId: r.unitId,
          conversionRate: r.conversionRate,
          barcode: r.barcode || undefined,
          costPrice: r.costPrice,
          sellingPrice: r.sellingPrice,
          isDefault: r.isDefault,
        })),
      };

      if (isEdit) {
        await itemsApi.update(id!, payload as UpdateItemPayload);
        message.success(t('common.updated'));
      } else {
        await itemsApi.create(payload as CreateItemPayload);
        message.success(t('common.created'));
      }
      navigate('/items');
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '64px auto' }} />;

  const unitColumns = [
    {
      title: t('items.unit'),
      dataIndex: 'unitId',
      key: 'unitId',
      width: 140,
      render: (_: unknown, __: unknown, index: number) => (
        <Select
          style={{ width: '100%' }}
          value={unitRows[index]?.unitId || undefined}
          onChange={(v) => updateUnitRow(index, 'unitId', v)}
          options={unitsOfMeasure.map((u) => ({ value: u.id, label: `${u.code} - ${u.name}` }))}
          placeholder={t('items.unit')}
        />
      ),
    },
    {
      title: t('items.conversionRate'),
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      width: 100,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0.0001}
          step={1}
          precision={4}
          value={unitRows[index]?.conversionRate}
          onChange={(v) => updateUnitRow(index, 'conversionRate', v)}
        />
      ),
    },
    {
      title: t('items.barcode'),
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          value={unitRows[index]?.barcode}
          onChange={(e) => updateUnitRow(index, 'barcode', e.target.value)}
        />
      ),
    },
    {
      title: t('items.costPrice'),
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 110,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          precision={2}
          value={unitRows[index]?.costPrice}
          onChange={(v) => updateUnitRow(index, 'costPrice', v)}
        />
      ),
    },
    {
      title: t('items.sellingPrice'),
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 110,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          precision={2}
          value={unitRows[index]?.sellingPrice}
          onChange={(v) => updateUnitRow(index, 'sellingPrice', v)}
        />
      ),
    },
    {
      title: t('items.isDefault'),
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      render: (_: unknown, __: unknown, index: number) => (
        <Switch
          checked={unitRows[index]?.isDefault}
          onChange={(v) => updateUnitRow(index, 'isDefault', v)}
        />
      ),
    },
    {
      key: 'action',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeUnitRow(index)} />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <span style={{ fontSize: 20, fontWeight: 600 }}>
              {isEdit ? t('items.edit') : t('items.create')}
            </span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            <AppstoreOutlined style={{ marginInlineEnd: 8 }} />
            {t('items.basicInfo')}
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sku"
                label={t('items.sku')}
                rules={[
                  { required: true, message: t('validation.required', { field: t('items.sku') }) },
                ]}
              >
                <Input style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label={t('items.type')}>
                <Select
                  options={[
                    { value: 'product', label: t('items.product') },
                    { value: 'service', label: t('items.service') },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="name"
            label={t('items.name')}
            rules={[
              { required: true, message: t('validation.required', { field: t('items.name') }) },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('items.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider style={{ margin: '16px 0 20px' }} />
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            <LinkOutlined style={{ marginInlineEnd: 8 }} />
            {t('items.pricingAndGroup')}
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="itemGroupId" label={t('items.itemGroup')}>
                <Select
                  allowClear
                  placeholder={t('common.noGroup')}
                  options={itemGroups.map((g) => ({ value: g.id, label: `${g.code} - ${g.name}` }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="defaultWarehouseId" label={t('items.defaultWarehouse')}>
                <Select
                  allowClear
                  placeholder={t('common.noGroup')}
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="costPrice" label={t('items.costPrice')}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="sellingPrice" label={t('items.sellingPrice')}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0 20px' }} />
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            {t('items.inventorySettings')}
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="reorderPoint" label={t('items.reorderPoint')}>
                <InputNumber style={{ width: '100%' }} min={0} precision={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="reorderQuantity" label={t('items.reorderQuantity')}>
                <InputNumber style={{ width: '100%' }} min={0} precision={0} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0 20px' }} />
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            <PictureOutlined style={{ marginInlineEnd: 8 }} />
            {t('items.image')}
          </Title>
          <Form.Item name="imageUrl" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <div
                style={{
                  border: '1px dashed #d9d9d9',
                  borderRadius: 8,
                  padding: 8,
                  textAlign: 'center',
                  marginBottom: 12,
                  background: '#fafafa',
                  minHeight: 180,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {currentImage ? (
                  <Image
                    src={currentImage}
                    style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain' }}
                    preview={false}
                  />
                ) : (
                  <Space direction="vertical" size={2} style={{ color: '#bbb' }}>
                    <PictureOutlined style={{ fontSize: 48 }} />
                    <span style={{ fontSize: 12 }}>{t('items.noImage')}</span>
                  </Space>
                )}
              </div>
              <Space>
                <Upload
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setUploading(true);
                    uploadApi
                      .uploadItemImage(file)
                      .then((res) => {
                        form.setFieldsValue({ imageUrl: res.url });
                        setUploading(false);
                      })
                      .catch(() => {
                        message.error(t('common.error'));
                        setUploading(false);
                      });
                    return false;
                  }}
                >
                  <Button
                    icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                    loading={uploading}
                  >
                    {t('items.uploadImage')}
                  </Button>
                </Upload>
                {currentImage && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => form.setFieldsValue({ imageUrl: '' })}
                  >
                    {t('common.delete')}
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
          {isEdit && (
            <Form.Item name="isActive" label={t('common.status')} valuePropName="checked">
              <Switch />
            </Form.Item>
          )}

          <Divider style={{ margin: '16px 0 20px' }} />
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            {t('items.units')}
          </Title>
          <Table
            dataSource={unitRows}
            columns={unitColumns}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            footer={() => (
              <Button type="dashed" onClick={addUnitRow} icon={<PlusOutlined />} block>
                {t('items.addUnit')}
              </Button>
            )}
          />

          <Divider style={{ margin: '20px 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => navigate('/items')}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
