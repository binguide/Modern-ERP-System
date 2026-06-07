import { Button, Card, Form, Input, Space, Typography, App } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';
import { PublicOnlyRoute } from '@components/ProtectedRoute/ProtectedRoute';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values);
      message.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } catch {
      message.error(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicOnlyRoute>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
          padding: 24,
        }}
      >
        <Card style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ marginBottom: 0 }}>
                {t('app.name')}
              </Title>
              <Text type="secondary">{t('auth.login')}</Text>
            </div>

            <Form<LoginFormValues>
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ email: 'admin@modern-erp.com', password: 'admin123' }}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label={t('auth.email')}
                rules={[
                  { required: true, message: t('validation.required', { field: t('auth.email') }) },
                  { type: 'email', message: t('validation.email') },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                label={t('auth.password')}
                rules={[{ required: true, message: t('validation.required', { field: t('auth.password') }) }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  {t('auth.login')}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </div>
    </PublicOnlyRoute>
  );
}
