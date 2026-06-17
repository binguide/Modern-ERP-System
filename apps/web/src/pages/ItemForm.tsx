import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import {
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Upload,
  Image,
  App,
  Spin,
  Modal,
  Space,
} from 'antd';
import { PlusOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  itemsApi,
  type CreateItemPayload,
  type UpdateItemPayload,
  type ItemUnitItem,
} from '@lib/api/endpoints/items';
import { warehousesApi, type WarehouseItem } from '@lib/api/endpoints/warehouses';
import { itemGroupsApi, type ItemGroupItem } from '@lib/api/endpoints/item-groups';
import { unitsOfMeasureApi, type UnitOfMeasureItem } from '@lib/api/endpoints/units-of-measure';
import { uploadApi } from '@lib/api/endpoints/upload';
import { Many2OneField } from '@components/Many2OneField/Many2OneField';
import {
  ErpForm,
  ErpFormHeader,
  ErpFormToolbar,
  ErpFormTabs,
  ErpFieldGrid,
  ErpField,
  ErpFormSidebar,
} from '@components/Erp';

interface UnitColumn {
  title?: string;
  key: string;
  dataIndex?: string;
  width?: number;
  render?: (_: unknown, __: unknown, index: number) => ReactNode;
}

const itemFormSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['product', 'service']),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  itemGroupId: z.string().optional(),
  imageUrl: z.string().optional(),
  reorderPoint: z.number().min(0),
  reorderQuantity: z.number().min(0),
  defaultWarehouseId: z.string().optional(),
  isActive: z.boolean(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

export default function ItemFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroupItem[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureItem[]>([]);
  const [unitRows, setUnitRows] = useState<ItemUnitItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sectionTab, setSectionTab] = useState(
    () => localStorage.getItem('itemFormActiveTab') || 'basic',
  );

  const handleTabChange = (key: string) => {
    setSectionTab(key);
    localStorage.setItem('itemFormActiveTab', key);
  };
  const isEdit = Boolean(id);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      type: 'product',
      costPrice: 0,
      sellingPrice: 0,
      itemGroupId: undefined,
      imageUrl: '',
      reorderPoint: 0,
      reorderQuantity: 0,
      defaultWarehouseId: undefined,
      isActive: true,
    },
  });

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const currentimageUrl = watch('imageUrl');

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
          reset({
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
        message.error(t('errors.loadError'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id, reset, message, t]);

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

  const removeUnitRow = (index: number) =>
    setUnitRows((prev) => prev.filter((_, i) => i !== index));

  const updateUnitRow = (index: number, field: string, value: unknown) => {
    setUnitRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const onSubmit = async (values: ItemFormValues) => {
    setSaving(true);
    try {
      const payload = {
        sku: values.sku,
        name: values.name,
        description: values.description || undefined,
        type: values.type,
        costPrice: values.costPrice,
        sellingPrice: values.sellingPrice,
        itemGroupId: values.itemGroupId || undefined,
        imageUrl: values.imageUrl || undefined,
        reorderPoint: values.reorderPoint || 0,
        reorderQuantity: values.reorderQuantity || 0,
        defaultWarehouseId: values.defaultWarehouseId || undefined,
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
      message.error(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const searchItemGroups = useCallback(async (query: string) => {
    const result = await itemGroupsApi.findAll({ page: 1, limit: 20, search: query });
    return result.data.map((g) => ({ value: g.id, label: `${g.code} - ${g.name}` }));
  }, []);

  const searchWarehouses = useCallback(async (query: string) => {
    const result = await warehousesApi.findAll({ page: 1, limit: 20, search: query });
    return result.data.map((w) => ({ value: w.id, label: w.name }));
  }, []);

  const unitColumns: UnitColumn[] = [
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

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />;

  return (
    <div className="erpnext-form">
      <ErpFormHeader
        title={isEdit ? t('items.edit') : t('items.create')}
        onBack={() => navigate('/items')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <ErpFormToolbar
        status="draft"
        saving={saving}
        onSave={handleSubmit(onSubmit)}
        onDiscard={() => navigate('/items')}
      />
      <ErpForm sidebar={<ErpFormSidebar />} sidebarOpen={sidebarOpen}>
        <ErpFormTabs
          tabs={[
            { key: 'basic', label: t('items.basicInfo') },
            { key: 'pricing', label: t('items.pricingAndGroup') },
            { key: 'inventory', label: t('items.inventorySettings') },
            { key: 'units', label: t('items.units') },
          ]}
          activeKey={sectionTab}
          onChange={handleTabChange}
        >
          {sectionTab === 'basic' && (
            <div style={{ display: 'flex', gap: 24, padding: 16 }}>
              <div style={{ flex: 1 }}>
                <ErpFieldGrid>
                  <ErpField label={t('items.sku')} required>
                    <Controller
                      name="sku"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Input
                            {...field}
                            style={{ textTransform: 'uppercase' }}
                            status={errors.sku ? 'error' : undefined}
                          />
                          {errors.sku && (
                            <span style={{ color: '#ef4444', fontSize: 11 }}>
                              {errors.sku.message}
                            </span>
                          )}
                        </div>
                      )}
                    />
                  </ErpField>
                  <ErpField label={t('items.type')}>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: 'product', label: t('items.product') },
                            { value: 'service', label: t('items.service') },
                          ]}
                        />
                      )}
                    />
                  </ErpField>
                  <ErpField label={t('items.name')} required>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Input {...field} status={errors.name ? 'error' : undefined} />
                          {errors.name && (
                            <span style={{ color: '#ef4444', fontSize: 11 }}>
                              {errors.name.message}
                            </span>
                          )}
                        </div>
                      )}
                    />
                  </ErpField>
                  <ErpField label={t('items.description')} fullWidth>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => <Input.TextArea {...field} rows={3} />}
                    />
                  </ErpField>
                </ErpFieldGrid>
              </div>
              <div style={{ width: 180, flexShrink: 0 }}>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => <Input {...field} hidden />}
                />
                <Upload
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setUploading(true);
                    uploadApi
                      .uploadItemImage(file)
                      .then((res) => {
                        reset((prev) => ({ ...prev, imageUrl: res.url }));
                        setUploading(false);
                      })
                      .catch(() => {
                        message.error(t('common.error'));
                        setUploading(false);
                      });
                    return false;
                  }}
                >
                  <div
                    style={{
                      border: '1px dashed #e5e5e5',
                      borderRadius: 6,
                      padding: 4,
                      textAlign: 'center',
                      background: uploading ? '#fff' : '#fafafa',
                      cursor: 'pointer',
                      minHeight: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {uploading ? (
                      <Spin />
                    ) : currentimageUrl ? (
                      <Image
                        src={currentimageUrl}
                        style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }}
                        preview={false}
                      />
                    ) : (
                      <Space direction="vertical" size={2} style={{ color: '#ccc' }}>
                        <PictureOutlined style={{ fontSize: 32 }} />
                        <span style={{ fontSize: 12 }}>{t('items.noImage')}</span>
                        <span style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                          {t('items.uploadImage')}
                        </span>
                      </Space>
                    )}
                  </div>
                </Upload>
                {currentimageUrl && (
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => reset((prev) => ({ ...prev, imageUrl: '' }))}
                    >
                      {t('common.remove')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          {sectionTab === 'pricing' && (
            <ErpFieldGrid>
              <ErpField label={t('items.itemGroup')}>
                <Controller
                  name="itemGroupId"
                  control={control}
                  render={({ field }) => (
                    <Many2OneField
                      value={field.value || undefined}
                      onChange={(val) => field.onChange(val ?? undefined)}
                      onSearch={searchItemGroups}
                      options={itemGroups.map((g) => ({
                        value: g.id,
                        label: `${g.code} - ${g.name}`,
                      }))}
                      placeholder={t('items.selectItemGroup')}
                    />
                  )}
                />
              </ErpField>
              <ErpField label={t('items.defaultWarehouse')}>
                <Controller
                  name="defaultWarehouseId"
                  control={control}
                  render={({ field }) => (
                    <Many2OneField
                      value={field.value || undefined}
                      onChange={(val) => field.onChange(val ?? undefined)}
                      onSearch={searchWarehouses}
                      options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                      placeholder={t('items.selectWarehouse')}
                    />
                  )}
                />
              </ErpField>
              <ErpField label={t('items.costPrice')}>
                <Controller
                  name="costPrice"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} style={{ width: '100%' }} min={0} precision={2} />
                  )}
                />
              </ErpField>
              <ErpField label={t('items.sellingPrice')}>
                <Controller
                  name="sellingPrice"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} style={{ width: '100%' }} min={0} precision={2} />
                  )}
                />
              </ErpField>
            </ErpFieldGrid>
          )}
          {sectionTab === 'inventory' && (
            <ErpFieldGrid>
              <ErpField label={t('items.reorderPoint')}>
                <Controller
                  name="reorderPoint"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} style={{ width: '100%' }} min={0} precision={0} />
                  )}
                />
              </ErpField>
              <ErpField label={t('items.reorderQuantity')}>
                <Controller
                  name="reorderQuantity"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} style={{ width: '100%' }} min={0} precision={0} />
                  )}
                />
              </ErpField>
              {isEdit && (
                <ErpField label={t('common.status')}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch checked={!!value} onChange={onChange} />
                    )}
                  />
                </ErpField>
              )}
            </ErpFieldGrid>
          )}
          {sectionTab === 'units' && (
            <div>
              <table
                className="erp-editable-table"
                style={{ margin: 16, width: 'calc(100% - 32px)' }}
              >
                <thead>
                  <tr>
                    {unitColumns.map((col) => (
                      <th key={col.key || col.dataIndex} style={{ width: col.width }}>
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unitRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={unitColumns.length}
                        style={{ textAlign: 'center', padding: 24, color: '#8d99a6' }}
                      >
                        {t('common.noData')}
                      </td>
                    </tr>
                  )}
                  {unitRows.map((row, index) => (
                    <tr key={row.id}>
                      {unitColumns.map((col) => (
                        <td key={col.key || col.dataIndex}>{col.render?.(null, null, index)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '0 16px 16px' }}>
                <Button type="dashed" onClick={addUnitRow} icon={<PlusOutlined />} block>
                  {t('items.addUnit')}
                </Button>
              </div>
            </div>
          )}
        </ErpFormTabs>
      </ErpForm>
      <Modal
        title={t('common.unsavedChanges')}
        open={blocker.state === 'blocked'}
        onOk={blocker.proceed}
        onCancel={blocker.reset}
        okText={t('common.leave')}
        cancelText={t('common.stay')}
      >
        {t('common.unsavedChangesMessage')}
      </Modal>
    </div>
  );
}
