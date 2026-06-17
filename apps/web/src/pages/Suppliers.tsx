import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, Switch, Button, App, Form } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { suppliersApi, SupplierItem } from '@lib/api/endpoints/suppliers';
import { FormField } from '@components/FormField';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

interface SupplierFormValues {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  isActive: boolean;
}

export default function SuppliersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierItem | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupplierFormValues>({
    defaultValues: {
      code: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      paymentTerms: '',
      isActive: true,
    },
  });

  const grid = useDataGrid<SupplierItem>({
    fetchFn: (params) => suppliersApi.findAll(params as Record<string, unknown>),
    storageKey: 'suppliers-list-columns',
    columnKeys: ['code', 'name', 'phone', 'email', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({
      code: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      paymentTerms: '',
      isActive: true,
    });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (supplier: SupplierItem) => {
      setEditing(supplier);
      reset({
        code: supplier.code,
        name: supplier.name,
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        address: supplier.address ?? '',
        taxId: supplier.taxId ?? '',
        paymentTerms: supplier.paymentTerms ?? '',
        isActive: supplier.isActive,
      });
      setModalOpen(true);
    },
    [reset],
  );

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await suppliersApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const onSubmit = async (values: SupplierFormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await suppliersApi.update(editing.id, values);
        message.success(t('common.updated'));
      } else {
        await suppliersApi.create(values);
        message.success(t('common.created'));
      }
      setModalOpen(false);
      grid.refresh();
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!modalOpen) setEditing(null);
  }, [modalOpen]);

  const columns = [
    { title: t('suppliers.code'), key: 'code', dataIndex: 'code', sorter: true, width: 100 },
    { title: t('suppliers.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    { title: t('suppliers.phone'), key: 'phone', dataIndex: 'phone', width: 140 },
    { title: t('suppliers.email'), key: 'email', dataIndex: 'email', width: 200 },
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

  return (
    <div className="erpnext-list">
      <DataGrid<SupplierItem>
        {...grid}
        title={t('menu.suppliers')}
        icon={<TeamOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('suppliers.code') },
          { key: 'name', label: t('suppliers.name') },
          { key: 'phone', label: t('suppliers.phone') },
          { key: 'email', label: t('suppliers.email') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="suppliers"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('suppliers.edit') : t('suppliers.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<SupplierFormValues>
            control={control}
            name="code"
            label={t('suppliers.code')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<SupplierFormValues>
            control={control}
            name="name"
            label={t('suppliers.name')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<SupplierFormValues>
            control={control}
            name="phone"
            label={t('suppliers.phone')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<SupplierFormValues>
            control={control}
            name="email"
            label={t('suppliers.email')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<SupplierFormValues>
            control={control}
            name="address"
            label={t('suppliers.address')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<SupplierFormValues>
            control={control}
            name="taxId"
            label={t('suppliers.taxId')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<SupplierFormValues>
            control={control}
            name="paymentTerms"
            label={t('suppliers.paymentTerms')}
            errors={errors}
          >
            <Input />
          </FormField>
          <Controller
            name="isActive"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Form.Item label={t('common.status')}>
                <Switch checked={!!value} onChange={onChange} />
              </Form.Item>
            )}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
