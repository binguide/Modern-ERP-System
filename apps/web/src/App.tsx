import { App as AntdApp, ConfigProvider, theme } from 'antd';
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
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          colorPrimaryHover: '#6366f1',
          borderRadius: 8,
          controlHeight: 32,
          controlHeightLG: 36,
          controlHeightSM: 28,
          fontFamily: 'inherit',
          fontSize: 14,
          fontSizeLG: 16,
          lineWidth: 1,
          wireframe: false,
        },
        components: {
          Card: {
            paddingLG: 24,
            borderRadiusLG: 12,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
          },
          Button: {
            borderRadiusLG: 8,
            borderRadius: 8,
            borderRadiusSM: 6,
            controlHeight: 32,
            controlHeightLG: 36,
            controlHeightSM: 28,
            paddingContentHorizontal: 20,
            paddingContentHorizontalLG: 24,
            paddingContentHorizontalSM: 12,
          },
          Form: {
            itemMarginBottom: 20,
            labelFontSize: 14,
            labelRequiredMarkColor: '#ef4444',
          },
          Input: {
            colorBgContainer: '#f8f9fa',
            activeBorderColor: '#818cf8',
            borderRadius: 8,
            borderRadiusLG: 8,
            controlHeight: 32,
            controlHeightLG: 36,
            controlHeightSM: 28,
          },
          DatePicker: {
            controlHeight: 32,
            controlHeightLG: 36,
            controlHeightSM: 28,
          },
          Select: {
            colorBgContainer: '#f8f9fa',
            activeBorderColor: '#818cf8',
            borderRadius: 8,
            borderRadiusLG: 8,
            controlHeight: 32,
            controlHeightLG: 36,
            controlHeightSM: 28,
          },
          Table: {
            borderRadiusLG: 12,
          },
          Switch: {
            trackHeight: 24,
            handleSize: 20,
          },
        },
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
