import { Button, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.language as 'ar' | 'en') ?? 'ar';

  const switchTo = current === 'ar' ? 'en' : 'ar';

  return (
    <Space>
      <Button
        type="text"
        icon={<GlobalOutlined />}
        onClick={() => {
          void i18n.changeLanguage(switchTo);
          document.documentElement.dir = switchTo === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = switchTo;
        }}
        style={{ color: '#fff' }}
      >
        {current === 'ar' ? 'EN' : 'AR'}
      </Button>
    </Space>
  );
}
