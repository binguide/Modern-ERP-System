import { Button, Card, Form, Input, Space, Typography, App } from 'antd';
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
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

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

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
          background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #6366f1 100%)',
          padding: 24,
        }}
      >
        <Card
          style={{
            width: 420,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(79,70,229,0.1)',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                }}
              >
                <SafetyCertificateOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <Title level={3} style={{ marginBottom: 4 }}>
                {t('app.name')}
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                {t('auth.login')}
              </Text>
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
                <Input prefix={<MailOutlined />} placeholder="email@example.com" />
              </Form.Item>

              <Form.Item
                name="password"
                label={t('auth.password')}
                rules={[
                  {
                    required: true,
                    message: t('validation.required', { field: t('auth.password') }),
                  },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{ borderRadius: 10, fontWeight: 500 }}
                >
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
