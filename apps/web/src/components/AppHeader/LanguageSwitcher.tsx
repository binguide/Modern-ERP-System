import { Button, theme } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { token } = theme.useToken();
  const current = (i18n.language as 'ar' | 'en') ?? 'ar';

  const switchTo = current === 'ar' ? 'en' : 'ar';

  return (
    <Button
      type="text"
      icon={<GlobalOutlined />}
      onClick={() => {
        void i18n.changeLanguage(switchTo);
        document.documentElement.dir = switchTo === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = switchTo;
      }}
      style={{ color: token.colorTextSecondary }}
    >
      {current === 'ar' ? 'EN' : 'AR'}
    </Button>
  );
}
