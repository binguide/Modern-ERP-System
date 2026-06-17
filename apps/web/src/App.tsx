import { App as AntdApp, ConfigProvider, theme } from 'antd';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { AbilityProvider } from './app/providers/AbilityProvider';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useUiStore } from '@stores/uiStore';

const antdLocale = { ar: arEG, en: enUS } as const;

const lightTheme = {
  token: {
    colorPrimary: '#2563eb',
    colorPrimaryHover: '#3b82f6',
    colorPrimaryActive: '#1d4ed8',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#0891b2',
    colorBgLayout: '#f0f4f8',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 4,
    controlHeight: 32,
    controlHeightLG: 38,
    controlHeightSM: 26,
    fontFamily: 'inherit',
    fontSize: 13,
    fontSizeLG: 15,
    lineWidth: 1,
    wireframe: false,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
    boxShadowSecondary: '0 4px 16px 0 rgb(0 0 0 / 0.08), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
  },
  components: {
    Card: {
      paddingLG: 24,
      borderRadiusLG: 14,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      colorBorderSecondary: '#e2e8f0',
    },
    Button: {
      borderRadiusLG: 6,
      borderRadius: 4,
      borderRadiusSM: 4,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
      paddingContentHorizontal: 22,
      paddingContentHorizontalLG: 28,
      paddingContentHorizontalSM: 14,
      fontWeight: 500,
    },
    Form: {
      itemMarginBottom: 12,
      labelFontSize: 11,
      labelRequiredMarkColor: '#dc2626',
      labelColor: '#475569',
    },
    Input: {
      colorBgContainer: '#ffffff',
      colorBorder: '#e2e8f0',
      hoverBorderColor: '#94a3b8',
      activeBorderColor: '#2563eb',
      borderRadius: 10,
      borderRadiusLG: 10,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
      paddingBlock: 6,
    },
    DatePicker: {
      colorBgContainer: '#ffffff',
      colorBorder: '#e2e8f0',
      hoverBorderColor: '#94a3b8',
      activeBorderColor: '#2563eb',
      borderRadius: 10,
      borderRadiusLG: 10,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
    },
    Select: {
      colorBgContainer: '#ffffff',
      colorBorder: '#e2e8f0',
      hoverBorderColor: '#94a3b8',
      activeBorderColor: '#2563eb',
      borderRadius: 10,
      borderRadiusLG: 10,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
    },
    Table: {
      borderRadiusLG: 14,
      colorBgContainer: '#ffffff',
      headerBg: '#f8fafc',
      headerColor: '#475569',
      headerBorderColor: '#e2e8f0',
      borderColor: '#f1f5f9',
      rowHoverBg: '#f1f5f9',
    },
    Switch: {
      trackHeight: 26,
      handleSize: 22,
    },
    Modal: {
      borderRadiusLG: 16,
      borderRadius: 12,
      boxShadowSecondary: '0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)',
    },
    Dropdown: {
      borderRadiusLG: 12,
      boxShadowSecondary: '0 8px 24px rgba(0,0,0,0.12)',
    },
    Menu: {
      itemBorderRadius: 6,
      itemMarginInline: 8,
      itemMarginBlock: 4,
    },
    Alert: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadius: 4,
    },
    Badge: {
      borderRadius: 4,
    },
  },
};

const darkTheme = {
  token: {
    colorPrimary: '#3b82f6',
    colorPrimaryHover: '#60a5fa',
    colorPrimaryActive: '#2563eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#06b6d4',
    colorBgLayout: '#0a0a0f',
    colorBgContainer: '#13131a',
    colorBgElevated: '#1a1a26',
    colorBgSpotlight: '#1a1a26',
    colorBorder: '#2a2a3a',
    colorBorderSecondary: '#1e1e2e',
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    controlHeight: 34,
    controlHeightLG: 38,
    controlHeightSM: 26,
    fontFamily: 'inherit',
    fontSize: 13,
    fontSizeLG: 15,
    lineWidth: 1,
    wireframe: false,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 16px 0 rgb(0 0 0 / 0.3), 0 2px 8px -2px rgb(0 0 0 / 0.15)',
    colorText: '#e2e8f0',
    colorTextSecondary: '#94a3b8',
    colorTextTertiary: '#64748b',
  },
  components: {
    Card: {
      paddingLG: 24,
      borderRadiusLG: 14,
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.2)',
      colorBorderSecondary: '#2a2a3a',
    },
    Button: {
      borderRadiusLG: 6,
      borderRadius: 4,
      borderRadiusSM: 4,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
      paddingContentHorizontal: 22,
      paddingContentHorizontalLG: 28,
      paddingContentHorizontalSM: 14,
      fontWeight: 500,
    },
    Form: {
      itemMarginBottom: 12,
      labelFontSize: 11,
      labelRequiredMarkColor: '#ef4444',
      labelColor: '#94a3b8',
    },
    Input: {
      colorBgContainer: '#1a1a26',
      colorBorder: '#2a2a3a',
      hoverBorderColor: '#4a4a5a',
      activeBorderColor: '#3b82f6',
      borderRadius: 10,
      borderRadiusLG: 10,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
      paddingBlock: 6,
    },
    DatePicker: {
      colorBgContainer: '#1a1a26',
      colorBorder: '#2a2a3a',
      hoverBorderColor: '#4a4a5a',
      activeBorderColor: '#3b82f6',
      borderRadius: 10,
      borderRadiusLG: 10,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
    },
    Select: {
      colorBgContainer: '#1a1a26',
      colorBorder: '#2a2a3a',
      hoverBorderColor: '#4a4a5a',
      activeBorderColor: '#3b82f6',
      borderRadius: 10,
      borderRadiusLG: 10,
      controlHeight: 32,
      controlHeightLG: 38,
      controlHeightSM: 26,
    },
    Table: {
      borderRadiusLG: 14,
      colorBgContainer: '#13131a',
      headerBg: '#1a1a26',
      headerColor: '#94a3b8',
      headerBorderColor: '#2a2a3a',
      borderColor: '#1e1e2e',
      rowHoverBg: '#1a1a26',
    },
    Switch: {
      trackHeight: 26,
      handleSize: 22,
    },
    Modal: {
      borderRadiusLG: 16,
      borderRadius: 12,
      boxShadowSecondary: '0 20px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)',
    },
    Dropdown: {
      borderRadiusLG: 12,
      boxShadowSecondary: '0 8px 24px rgba(0,0,0,0.3)',
    },
    Menu: {
      itemBorderRadius: 6,
      itemMarginInline: 8,
      itemMarginBlock: 4,
    },
    Alert: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadius: 4,
    },
    Badge: {
      borderRadius: 4,
    },
  },
};

export default function App() {
  const { i18n } = useTranslation();
  const storeTheme = useUiStore((s) => s.theme);
  const locale =
    (i18n.language as 'ar' | 'en') in antdLocale ? (i18n.language as 'ar' | 'en') : 'ar';
  const isDark = storeTheme === 'dark';

  return (
    <ConfigProvider
      locale={antdLocale[locale]}
      direction={locale === 'ar' ? 'rtl' : 'ltr'}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        ...(isDark ? darkTheme : lightTheme),
      }}
    >
      <AntdApp>
        <QueryProvider>
          <AuthProvider>
            <AbilityProvider>
              <RouterProvider router={router} />
            </AbilityProvider>
          </AuthProvider>
        </QueryProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
