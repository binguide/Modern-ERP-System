import { useState, useCallback, useEffect } from 'react';
import { Modal, Input, Switch, Button, App, Form } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerInput } from '@modern-erp/shared-schemas';
import { customersApi, CustomerItem } from '@lib/api/endpoints/customers';
import { FormField } from '@components/FormField';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';

export default function CustomersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerItem | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      isActive: true,
    },
  });

  const grid = useDataGrid<CustomerItem>({
    fetchFn: (params) => customersApi.findAll(params as Record<string, unknown>),
    storageKey: 'customers-list-columns',
    columnKeys: ['code', 'name', 'phone', 'email', 'isActive'],
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ code: '', name: '', phone: '', email: '', address: '', taxId: '', isActive: true });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (customer: CustomerItem) => {
      setEditing(customer);
      reset({
        code: customer.code,
        name: customer.name,
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        address: customer.address ?? '',
        taxId: customer.taxId ?? '',
        isActive: customer.isActive,
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
            await customersApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const onSubmit = async (values: CustomerInput) => {
    setSaving(true);
    try {
      if (editing) {
        await customersApi.update(editing.id, values);
        message.success(t('common.updated'));
      } else {
        await customersApi.create(values);
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
    { title: t('customers.code'), key: 'code', dataIndex: 'code', sorter: true, width: 100 },
    { title: t('customers.name'), key: 'name', dataIndex: 'name', sorter: true, width: 200 },
    { title: t('customers.phone'), key: 'phone', dataIndex: 'phone', width: 140 },
    { title: t('customers.email'), key: 'email', dataIndex: 'email', width: 200 },
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
      <DataGrid<CustomerItem>
        {...grid}
        title={t('menu.customers')}
        icon={<TeamOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'code', label: t('customers.code') },
          { key: 'name', label: t('customers.name') },
          { key: 'phone', label: t('customers.phone') },
          { key: 'email', label: t('customers.email') },
          { key: 'isActive', label: t('common.status') },
        ]}
        basePath="customers"
        onRowClick={openEdit}
        onCreate={openCreate}
        onDeleteSelected={handleDeleteSelected}
      />

      <Modal
        title={editing ? t('customers.edit') : t('customers.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField<CustomerInput>
            control={control}
            name="code"
            label={t('customers.code')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<CustomerInput>
            control={control}
            name="name"
            label={t('customers.name')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<CustomerInput>
            control={control}
            name="phone"
            label={t('customers.phone')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<CustomerInput>
            control={control}
            name="email"
            label={t('customers.email')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<CustomerInput>
            control={control}
            name="address"
            label={t('customers.address')}
            errors={errors}
          >
            <Input />
          </FormField>
          <FormField<CustomerInput>
            control={control}
            name="taxId"
            label={t('customers.taxId')}
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
