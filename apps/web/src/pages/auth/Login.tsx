import { Button, Input, Typography, App, Card, theme } from 'antd';
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@modern-erp/shared-schemas';
import { useAuthStore } from '@stores/authStore';
import { PublicOnlyRoute } from '@components/ProtectedRoute/ProtectedRoute';
import { FormField } from '@components/FormField';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@modern-erp.com', password: 'admin123' },
  });

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const onSubmit = async (values: LoginInput) => {
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
          background: token.colorBgLayout,
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 440, width: '100%' }}>
          <Card style={{ padding: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <SafetyCertificateOutlined style={{ fontSize: 26, color: '#fff' }} />
              </div>
              <Title level={3} style={{ marginBottom: 4 }}>
                {t('app.name')}
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                {t('auth.login')}
              </Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    color: token.colorTextSecondary,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t('auth.email')}
                </Text>
                <FormField<LoginInput> control={control} name="email" label="" errors={errors}>
                  <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
                </FormField>
              </div>

              <div style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    color: token.colorTextSecondary,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t('auth.password')}
                </Text>
                <FormField<LoginInput> control={control} name="password" label="" errors={errors}>
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                </FormField>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                style={{ marginTop: 24 }}
              >
                {t('auth.login')}
              </Button>
            </form>
          </Card>
          <Text
            type="secondary"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 24,
              fontSize: 12,
            }}
          >
            Modern ERP System &copy; {new Date().getFullYear()}
          </Text>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
