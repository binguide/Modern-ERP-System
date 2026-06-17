import { useState, useEffect } from 'react';
import {
  Card,
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
  Form,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@lib/api/endpoints/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { user, updateProfile } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  const onSaveProfile = async (values: ProfileFormValues) => {
    if (!values.firstName || !values.lastName) {
      message.error(t('validation.required', { field: '' }));
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || null,
      });
      message.success(t('common.updated'));
    } catch {
      message.error(t('common.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values: PasswordFormValues) => {
    if (values.newPassword.length < 8) {
      message.error(t('validation.minLength', { min: 8 }));
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      message.error(t('validation.passwordsMismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      message.success(t('auth.passwordChanged'));
      resetPassword();
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
        <form onSubmit={handleProfileSubmit(onSaveProfile)}>
          <Row gutter={16}>
            <Col span={12}>
              <Controller
                name="firstName"
                control={profileControl}
                render={({ field }) => (
                  <Form.Item
                    label={t('user.firstName')}
                    validateStatus={profileErrors.firstName ? 'error' : undefined}
                    help={profileErrors.firstName?.message}
                    required
                  >
                    <Input {...field} />
                  </Form.Item>
                )}
              />
            </Col>
            <Col span={12}>
              <Controller
                name="lastName"
                control={profileControl}
                render={({ field }) => (
                  <Form.Item
                    label={t('user.lastName')}
                    validateStatus={profileErrors.lastName ? 'error' : undefined}
                    help={profileErrors.lastName?.message}
                    required
                  >
                    <Input {...field} />
                  </Form.Item>
                )}
              />
            </Col>
          </Row>
          <Controller
            name="email"
            control={profileControl}
            render={({ field }) => (
              <Form.Item label={t('auth.email')}>
                <Input {...field} disabled />
              </Form.Item>
            )}
          />
          <Controller
            name="phone"
            control={profileControl}
            render={({ field }) => (
              <Form.Item label={t('user.phone')}>
                <Input {...field} />
              </Form.Item>
            )}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" loading={savingProfile}>
              {t('common.save')}
            </Button>
          </div>
        </form>
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
        <form onSubmit={handlePasswordSubmit(onChangePassword)}>
          <Controller
            name="currentPassword"
            control={passwordControl}
            render={({ field }) => (
              <Form.Item
                label={t('auth.oldPassword')}
                validateStatus={passwordErrors.currentPassword ? 'error' : undefined}
                help={passwordErrors.currentPassword?.message}
                required
              >
                <Input.Password {...field} />
              </Form.Item>
            )}
          />
          <Controller
            name="newPassword"
            control={passwordControl}
            render={({ field }) => (
              <Form.Item
                label={t('auth.newPassword')}
                validateStatus={passwordErrors.newPassword ? 'error' : undefined}
                help={passwordErrors.newPassword?.message}
                required
              >
                <Input.Password {...field} />
              </Form.Item>
            )}
          />
          <Controller
            name="confirmPassword"
            control={passwordControl}
            render={({ field }) => (
              <Form.Item
                label={t('auth.confirmPassword')}
                validateStatus={passwordErrors.confirmPassword ? 'error' : undefined}
                help={passwordErrors.confirmPassword?.message}
                required
              >
                <Input.Password {...field} />
              </Form.Item>
            )}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" loading={savingPassword}>
              {t('auth.changePassword')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
