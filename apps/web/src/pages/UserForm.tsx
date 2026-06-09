import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
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
} from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { usersApi, CreateUserPayload, UpdateUserPayload } from '@lib/api/endpoints/users';
import { branchesApi, BranchItem } from '@lib/api/endpoints/branches';
import { rolesApi, RoleItem } from '@lib/api/endpoints/roles';

const { Title } = Typography;

export default function UserFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const isEdit = Boolean(id);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [branchesData, rolesData] = await Promise.all([
          branchesApi.findAll({ page: 1, limit: 100 }),
          rolesApi.findAll({ page: 1, limit: 100 }),
        ]);
        setBranches(branchesData.data);
        setRoles(rolesData.data);

        if (id) {
          const user = await usersApi.findById(id);
          form.setFieldsValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            branchId: user.branchId || undefined,
            roleIds: user.roles.map((r) => r.id),
            isActive: user.isActive,
          });
        }
      } catch {
        message.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id, form, message, t]);

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (isEdit) {
        const payload: UpdateUserPayload = {
          firstName: values.firstName as string,
          lastName: values.lastName as string,
          email: values.email as string,
          phone: (values.phone as string) || undefined,
          branchId: (values.branchId as string) || undefined,
          roleIds: values.roleIds as string[] | undefined,
          isActive: values.isActive as boolean,
        };
        await usersApi.update(id!, payload);
        message.success(t('common.updated'));
      } else {
        const payload: CreateUserPayload = {
          firstName: values.firstName as string,
          lastName: values.lastName as string,
          email: values.email as string,
          password: values.password as string,
          phone: (values.phone as string) || undefined,
          branchId: (values.branchId as string) || undefined,
          roleIds: values.roleIds as string[] | undefined,
        };
        await usersApi.create(payload);
        message.success(t('common.created'));
      }
      navigate('/users');
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '64px auto' }} />;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <span style={{ fontSize: 20, fontWeight: 600 }}>
              {isEdit ? t('user.editUser') : t('user.createUser')}
            </span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            <UserOutlined style={{ marginInlineEnd: 8 }} />
            {t('user.personalInfo')}
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label={t('user.firstName')}
                rules={[
                  {
                    required: true,
                    message: t('validation.required', { field: t('user.firstName') }),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label={t('user.lastName')}
                rules={[
                  {
                    required: true,
                    message: t('validation.required', { field: t('user.lastName') }),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label={t('auth.email')}
                rules={[
                  { required: true, message: t('validation.required', { field: t('auth.email') }) },
                  { type: 'email', message: t('validation.email') },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={t('user.phone')}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0 20px' }} />
          <Title level={5} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
            <SettingOutlined style={{ marginInlineEnd: 8 }} />
            {t('user.accountInfo')}
          </Title>

          {!isEdit && (
            <Form.Item
              name="password"
              label={t('auth.password')}
              rules={[
                {
                  required: true,
                  message: t('validation.required', { field: t('auth.password') }),
                },
                { min: 8, message: t('validation.minLength', { min: 8 }) },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="branchId" label={t('users.branch')}>
                <Select allowClear placeholder={t('users.branch')}>
                  {branches.map((b) => (
                    <Select.Option key={b.id} value={b.id}>
                      {b.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roleIds" label={t('users.roles')}>
                <Select mode="multiple" allowClear placeholder={t('users.roles')}>
                  {roles.map((r) => (
                    <Select.Option key={r.id} value={r.id}>
                      {r.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {isEdit && (
            <Form.Item name="isActive" label={t('user.isActive')} valuePropName="checked">
              <Switch />
            </Form.Item>
          )}

          <Divider style={{ margin: '20px 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => navigate('/users')}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
