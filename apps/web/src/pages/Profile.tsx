import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  App,
  Spin,
  Typography,
  Row,
  Col,
  Avatar,
  Descriptions,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@lib/api/endpoints/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { user, updateProfile } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, profileForm]);

  const onSaveProfile = async (values: Record<string, unknown>) => {
    setSavingProfile(true);
    try {
      await updateProfile({
        firstName: values.firstName as string,
        lastName: values.lastName as string,
        phone: (values.phone as string) || null,
      });
      message.success(t('common.updated'));
    } catch {
      message.error(t('common.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values: Record<string, unknown>) => {
    setSavingPassword(true);
    try {
      await authApi.changePassword(values.currentPassword as string, values.newPassword as string);
      message.success(t('auth.passwordChanged'));
      passwordForm.resetFields();
    } catch {
      message.error(t('common.error'));
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#4f46e5' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user.firstName} {user.lastName}
            </Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </div>
        <Descriptions column={2} size="small">
          <Descriptions.Item label={t('user.fullName')}>
            {user.firstName} {user.lastName}
          </Descriptions.Item>
          <Descriptions.Item label={t('auth.email')}>{user.email}</Descriptions.Item>
          <Descriptions.Item label={t('user.phone')}>{user.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('user.lastLogin')}>
            {user.lastLoginAt ? dayjs(user.lastLoginAt).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <Space>
            <UserOutlined />
            <span>{t('user.personalInfo')}</span>
          </Space>
        }
        style={{ marginBottom: 24, borderRadius: 12 }}
      >
        <Form form={profileForm} layout="vertical" onFinish={onSaveProfile}>
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
          <Form.Item name="email" label={t('auth.email')}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="phone" label={t('user.phone')}>
            <Input />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" loading={savingProfile}>
              {t('common.save')}
            </Button>
          </div>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <LockOutlined />
            <span>{t('auth.changePassword')}</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Form form={passwordForm} layout="vertical" onFinish={onChangePassword}>
          <Form.Item
            name="currentPassword"
            label={t('auth.oldPassword')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('auth.oldPassword') }),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t('auth.newPassword')}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('auth.newPassword') }),
              },
              { min: 8, message: t('validation.minLength', { min: 8 }) },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('auth.confirmPassword')}
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
                message: t('validation.required', { field: t('auth.confirmPassword') }),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error(t('validation.passwordsMismatch')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" loading={savingPassword}>
              {t('auth.changePassword')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
