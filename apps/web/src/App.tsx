import { App as AntdApp, ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { AbilityProvider } from './app/providers/AbilityProvider';
import { AppRouter } from './app/router';

const antdLocale = { ar: arEG, en: enUS } as const;

export default function App() {
  const { i18n } = useTranslation();
  const locale =
    (i18n.language as 'ar' | 'en') in antdLocale ? (i18n.language as 'ar' | 'en') : 'ar';

  return (
    <ConfigProvider
      locale={antdLocale[locale]}
      direction={locale === 'ar' ? 'rtl' : 'ltr'}
      theme={{
        token: { colorPrimary: '#1677ff', borderRadius: 6 },
      }}
    >
      <AntdApp>
        <QueryProvider>
          <AuthProvider>
            <AbilityProvider>
              <AppRouter />
            </AbilityProvider>
          </AuthProvider>
        </QueryProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
